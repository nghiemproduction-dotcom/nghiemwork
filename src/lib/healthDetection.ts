import { TaskHealthData, HealthMetricType, HealthMetrics } from '@/types';

// AI-powered health data detection from task titles
const HEALTH_KEYWORDS = {
  sleep: {
    keywords: ['ngủ', 'sleep', 'đi ngủ', 'nghỉ ngơi', 'thư giãn', 'napping', 'đêm', 'khuya'],
    fields: [
      { field: 'sleepHours' as keyof HealthMetrics, label: 'Thời gian ngủ (giờ)', type: 'number' as const, unit: 'giờ', min: 0, max: 24 },
      { field: 'sleepQuality' as keyof HealthMetrics, label: 'Chất lượng giấc ngủ', type: 'select' as const, options: ['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Rất tốt'] }
    ]
  },
  exercise: {
    keywords: ['tập', 'chạy', 'gym', 'yoga', 'thể thao', 'đi bộ', 'bơi', 'đạp xe', 'workout', 'fitness'],
    fields: [
      { field: 'calories' as keyof HealthMetrics, label: 'Calories tiêu thụ', type: 'number' as const, unit: 'kcal', min: 0, max: 2000 },
      { field: 'steps' as keyof HealthMetrics, label: 'Số bước chân', type: 'number' as const, unit: 'bước', min: 0, max: 100000 },
      { field: 'heartRate' as keyof HealthMetrics, label: 'Nhịp tim trung bình', type: 'number' as const, unit: 'bpm', min: 40, max: 200 }
    ]
  },
  nutrition: {
    keywords: ['ăn', 'uống', 'bữa', 'cơm', 'sữa', 'trái cây', 'rau', 'healthy', 'diet', 'kcal'],
    fields: [
      { field: 'calories' as keyof HealthMetrics, label: 'Calories nạp vào', type: 'number' as const, unit: 'kcal', min: 0, max: 5000 },
      { field: 'water' as keyof HealthMetrics, label: 'Lượng nước uống', type: 'number' as const, unit: 'ml', min: 0, max: 5000 }
    ]
  },
  hydration: {
    keywords: ['nước', 'uống nước', 'hydratation', 'độ ẩm', 'water'],
    fields: [
      { field: 'water' as keyof HealthMetrics, label: 'Lượng nước uống', type: 'number' as const, unit: 'ml', min: 0, max: 5000 }
    ]
  },
  weight: {
    keywords: ['cân nặng', 'cân', 'kg', 'giảm cân', 'tăng cân', 'weight', 'diet'],
    fields: [
      { field: 'weight' as keyof HealthMetrics, label: 'Cân nặng', type: 'number' as const, unit: 'kg', min: 20, max: 300 }
    ]
  },
  mood: {
    keywords: ['tâm trạng', 'cảm xúc', 'mood', 'vui', 'buồn', 'stress', 'lo âu', 'thư giãn'],
    fields: [
      { field: 'mood' as keyof HealthMetrics, label: 'Tâm trạng', type: 'select' as const, options: ['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Rất tốt'] }
    ]
  },
  energy: {
    keywords: ['năng lượng', 'sức khỏe', 'mệt mỏi', 'tươi mới', 'energy', 'mệt', 'hơi'],
    fields: [
      { field: 'energy' as keyof HealthMetrics, label: 'Mức năng lượng', type: 'select' as const, options: ['Rất thấp', 'Thấp', 'Bình thường', 'Cao', 'Rất cao'] }
    ]
  },
  heart_health: {
    keywords: ['tim mạch', 'huyết áp', 'nhịp tim', 'blood pressure', 'heart rate', 'cardio'],
    fields: [
      { field: 'heartRate' as keyof HealthMetrics, label: 'Nhịp tim', type: 'number' as const, unit: 'bpm', min: 40, max: 200 },
      { field: 'bloodPressure' as keyof HealthMetrics, label: 'Huyết áp', type: 'number' as const, unit: 'mmHg' }
    ]
  },
  stress: {
    keywords: ['stress', 'căng thẳng', 'áp lực', 'lo âu', 'anxiety', 'relax', 'thư giãn'],
    fields: [
      { field: 'mood' as keyof HealthMetrics, label: 'Mức độ stress', type: 'range' as const, min: 1, max: 10 }
    ]
  },
  productivity: {
    keywords: ['làm việc', 'học tập', 'dự án', 'hoàn thành', 'sản xuất', 'hiệu suất', 'focus'],
    fields: [
      { field: 'energy' as keyof HealthMetrics, label: 'Mức độ tập trung', type: 'range' as const, min: 1, max: 10 },
      { field: 'mood' as keyof HealthMetrics, label: 'Hiệu suất công việc', type: 'range' as const, min: 1, max: 10 }
    ]
  }
};

export function detectHealthMetrics(taskTitle: string): TaskHealthData {
  const title = taskTitle.toLowerCase();
  const detectedMetrics: HealthMetricType[] = [];
  const allFields: TaskHealthData['suggestedFields'] = [];
  let maxConfidence = 0;

  // Check each health category
  Object.entries(HEALTH_KEYWORDS).forEach(([metricType, config]) => {
    const matchedKeywords = config.keywords.filter(keyword => title.includes(keyword));
    const confidence = matchedKeywords.length / config.keywords.length;
    
    if (matchedKeywords.length > 0) {
      detectedMetrics.push(metricType as HealthMetricType);
      allFields.push(...config.fields);
      maxConfidence = Math.max(maxConfidence, confidence);
    }
  });

  // Remove duplicate fields
  const uniqueFields = allFields.filter((field, index, self) => 
    index === self.findIndex(f => f.field === field.field)
  );

  return {
    taskId: '', // Will be filled by caller
    taskTitle,
    detectedMetrics,
    confidence: maxConfidence,
    suggestedFields: uniqueFields
  };
}

export function shouldShowHealthPrompt(taskTitle: string): boolean {
  const detection = detectHealthMetrics(taskTitle);
  return detection.detectedMetrics.length > 0 && detection.confidence > 0.3;
}

// Simulate AI detection (in real app, would call actual AI service)
export async function analyzeTaskForHealth(taskTitle: string): Promise<TaskHealthData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const result = detectHealthMetrics(taskTitle);
  
  // Add some AI-like intelligence
  if (taskTitle.includes('đêm') || taskTitle.includes('khuya')) {
    result.suggestedFields = result.suggestedFields.map(field => 
      field.field === 'sleepHours' 
        ? { ...field, label: 'Thời gian ngủ đêm (giờ)' }
        : field
    );
  }
  
  if (taskTitle.includes('tập thể dục') || taskTitle.includes('gym')) {
    result.suggestedFields.push({
      field: 'energy' as keyof HealthMetrics,
      label: 'Cảm giác sau khi tập',
      type: 'select',
      options: ['Rất mệt', 'Hơi mệt', 'Bình thường', 'Tươi mới', 'Tràn đầy năng lượng']
    });
  }
  
  return result;
}
