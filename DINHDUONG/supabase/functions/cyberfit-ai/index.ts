import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, type, userData, mode, exceptionText, userProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Handle exception mode
    const effectiveType = mode === 'exception' ? 'exception' : type;
    const effectiveUserData = userProfile || userData;

    let systemPrompt = "";

    if (effectiveType === "exception") {
      systemPrompt = `Bạn là CyberFit AI. Người dùng có tình huống ngoại lệ hôm nay. Hãy điều chỉnh lịch tập và thực đơn phù hợp.
Thông tin người dùng: ${JSON.stringify(effectiveUserData || {})}
Tình huống ngoại lệ: "${exceptionText}"

Trả về JSON:
{
  "exercises": [{"exerciseId": "id", "sessionId": "session_id", "order": number, "completed": false}],
  "meals": [{"mealId": "id", "time": "HH:MM", "consumed": false, "aiReason": "lý do phù hợp với hoàn cảnh"}],
  "message": "Giải thích ngắn gọn về thay đổi"
}

exerciseId từ: c01-c10, r01-r10, s01-s10, b01-b10, x01-x10
mealId từ: mc01-mc10, sn01-sn10, tr01-tr10, sp01-sp10, dk01-dk10
Nếu người dùng bị ốm/chấn thương, chọn bài tập nhẹ (static/balance). Nếu đi nhậu, điều chỉnh calo hợp lý.`;
      
      const exResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "user", content: `${systemPrompt}\n\nTạo kế hoạch thay thế ngay bây giờ.` }],
          stream: false,
          response_format: { type: "json_object" },
        }),
      });
      if (!exResp.ok) throw new Error("AI exception error");
      const exData = await exResp.json();
      const content = exData.choices?.[0]?.message?.content || '{}';
      try {
        const plan = JSON.parse(content);
        return new Response(JSON.stringify({ plan, message: plan.message || 'Đã cập nhật kế hoạch.' }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ error: "AI không trả về JSON hợp lệ" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (effectiveType === "plan") {
      // Super AI planning mode
      systemPrompt = `Bạn là CyberFit AI - trợ lý thể hình chuyên nghiệp. Bạn PHẢI trả lời bằng tiếng Việt.
Người dùng cung cấp thông tin cơ thể và mục tiêu. Hãy phân tích và tạo kế hoạch.

Thông tin người dùng: ${JSON.stringify(userData || {})}

Hãy trả về JSON với cấu trúc:
{
  "targetCalories": number,
  "targetWater": number,
  "estimatedWeeks": number,
  "issues": ["vấn đề 1", "vấn đề 2"],
  "recommendations": ["khuyến nghị 1", "khuyến nghị 2"],
  "exercisePlan": [{"exerciseId": "id", "sessionId": "session_id", "order": number}],
  "mealPlan": [{"mealId": "id", "time": "HH:MM", "aiReason": "lý do"}]
}

QUAN TRỌNG: exerciseId phải từ danh sách: c01-c10, r01-r10, s01-s10, b01-b10, x01-x10
mealId phải từ danh sách: mc01-mc10, sn01-sn10, tr01-tr10, sp01-sp10, dk01-dk10
Chọn bài tập và món ăn PHÙ HỢP với tình trạng sức khỏe, chấn thương, mục tiêu của người dùng.`;
    } else {
      // Chat mode  
      systemPrompt = `Bạn là CyberFit AI - trợ lý thể hình ảo thông minh, nói tiếng Việt tự nhiên, thân thiện như bạn bè.
Bạn chuyên về: dinh dưỡng, tập luyện, giảm cân, tăng cơ, sức khỏe tổng quát.
Trả lời ngắn gọn, dễ hiểu, có emoji. Đưa lời khuyên thực tế dựa trên khoa học.
Nếu người dùng hỏi ngoài lĩnh vực, nhẹ nhàng đưa về chủ đề sức khỏe.`;
    }

    const body: Record<string, unknown> = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        ...(messages || []),
      ],
    };

    if (type === "plan") {
      // Use tool calling for structured output
      body.tools = [
        {
          type: "function",
          function: {
            name: "create_fitness_plan",
            description: "Create a comprehensive fitness and nutrition plan",
            parameters: {
              type: "object",
              properties: {
                targetCalories: { type: "number", description: "Daily calorie target" },
                targetWater: { type: "number", description: "Daily water target in ml" },
                estimatedWeeks: { type: "number", description: "Estimated weeks to reach goal" },
                issues: { type: "array", items: { type: "string" }, description: "Health issues to address" },
                recommendations: { type: "array", items: { type: "string" }, description: "Recommendations" },
                exercisePlan: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      exerciseId: { type: "string" },
                      sessionId: { type: "string" },
                      order: { type: "number" },
                    },
                    required: ["exerciseId", "sessionId", "order"],
                  },
                },
                mealPlan: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      mealId: { type: "string" },
                      time: { type: "string" },
                      aiReason: { type: "string" },
                    },
                    required: ["mealId", "time", "aiReason"],
                  },
                },
              },
              required: ["targetCalories", "targetWater", "estimatedWeeks", "issues", "recommendations", "exercisePlan", "mealPlan"],
            },
          },
        },
      ];
      body.tool_choice = { type: "function", function: { name: "create_fitness_plan" } };
      body.stream = false;
    } else {
      body.stream = true;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Quá nhiều yêu cầu, vui lòng thử lại sau." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Hết lượt sử dụng AI, vui lòng nạp thêm credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Lỗi AI gateway" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (effectiveType === "plan") {
      // Non-streaming: parse tool call response
      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall) {
        const plan = JSON.parse(toolCall.function.arguments);
        return new Response(JSON.stringify(plan), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI không trả về kế hoạch" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Streaming response for chat
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("cyberfit-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
