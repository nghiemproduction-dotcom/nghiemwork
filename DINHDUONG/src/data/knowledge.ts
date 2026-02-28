import { KnowledgeArticle } from '@/types';

export const knowledgeArticles: KnowledgeArticle[] = [
  {
    id: 'k01',
    title: 'Nhịn Ăn Gián Đoạn (IF) - Phương Pháp Giảm Cân Khoa Học',
    summary: 'Tìm hiểu cơ chế hoạt động, lợi ích và cách áp dụng IF an toàn.',
    tags: ['Dinh dưỡng', 'Giảm cân', 'IF'],
    content: `# Nhịn Ăn Gián Đoạn là gì?

Nhịn Ăn Gián Đoạn (Intermittent Fasting - IF) không phải là chế độ ăn kiêng mà là **lịch trình ăn uống**. Bạn luân phiên giữa giai đoạn ăn và giai đoạn nhịn ăn.

## Các phương pháp phổ biến

**16:8** - Nhịn 16 giờ, ăn trong 8 giờ. Ví dụ: ăn từ 12h trưa đến 20h tối.

**18:6** - Nhịn 18 giờ, ăn trong 6 giờ. Phù hợp người đã quen IF.

**20:4** - Nhịn 20 giờ, ăn trong 4 giờ (Warrior Diet).

## Lợi ích khoa học

- Giảm mỡ cơ thể mà ít mất cơ bắp
- Cải thiện độ nhạy insulin
- Tăng hormone tăng trưởng (HGH) lên đến 500%
- Kích hoạt quá trình tự thực bào (autophagy) - tế bào tự làm sạch
- Giảm viêm trong cơ thể

## Lưu ý quan trọng

⚠️ Trong thời gian nhịn, chỉ được uống nước lọc, trà đen, cà phê đen (không đường, không sữa).

⚠️ Không phù hợp cho phụ nữ mang thai, người có tiền sử rối loạn ăn uống, người dưới 18 tuổi.`
  },
  {
    id: 'k02',
    title: 'Cách Tính TDEE và Calo Cần Thiết Mỗi Ngày',
    summary: 'Hiểu về TDEE, BMR và cách thiết lập mục tiêu calo phù hợp.',
    tags: ['Dinh dưỡng', 'Calo', 'TDEE'],
    content: `# TDEE là gì?

TDEE (Total Daily Energy Expenditure) là tổng năng lượng cơ thể tiêu hao trong một ngày, bao gồm:

## Công thức BMR (Harris-Benedict)

**Nam:** BMR = 88.362 + (13.397 × cân nặng kg) + (4.799 × chiều cao cm) - (5.677 × tuổi)

**Nữ:** BMR = 447.593 + (9.247 × cân nặng kg) + (3.098 × chiều cao cm) - (4.330 × tuổi)

## Hệ số hoạt động

| Mức độ | Hệ số |
|--------|-------|
| Ít vận động | BMR × 1.2 |
| Nhẹ (1-3 ngày/tuần) | BMR × 1.375 |
| Vừa (3-5 ngày/tuần) | BMR × 1.55 |
| Nặng (6-7 ngày/tuần) | BMR × 1.725 |

## Mục tiêu

- **Giảm cân:** TDEE - 500 calo/ngày (giảm ~0.5kg/tuần)
- **Giữ cân:** Ăn đúng TDEE
- **Tăng cân/cơ:** TDEE + 300-500 calo/ngày`
  },
  {
    id: 'k03',
    title: 'Protein - Viên Gạch Xây Dựng Cơ Bắp',
    summary: 'Tất cả về protein: nhu cầu, nguồn thực phẩm và thời điểm nạp.',
    tags: ['Dinh dưỡng', 'Protein', 'Cơ bắp'],
    content: `# Tại sao Protein quan trọng?

Protein là dưỡng chất thiết yếu cho việc xây dựng và sửa chữa cơ bắp, sản xuất enzyme và hormone.

## Nhu cầu Protein hàng ngày

- **Người bình thường:** 0.8g/kg cân nặng
- **Tập thể dục nhẹ:** 1.2-1.4g/kg
- **Tập nặng/Tăng cơ:** 1.6-2.2g/kg
- **Giảm cân:** 1.8-2.4g/kg (giữ cơ)

## Top nguồn Protein Việt Nam

| Thực phẩm | Protein/100g |
|-----------|-------------|
| Ức gà | 31g |
| Cá hồi | 25g |
| Thịt bò nạc | 26g |
| Đậu phụ | 8g |
| Trứng (1 quả) | 6g |
| Tôm | 24g |

## Thời điểm nạp tối ưu

🕐 **Sau tập 30-60 phút**: Cửa sổ vàng hấp thụ protein
🕐 **Trước ngủ**: Casein protein giúp phục hồi cơ qua đêm
🕐 **Chia đều**: 20-40g mỗi bữa, 4-5 bữa/ngày`
  },
  {
    id: 'k04',
    title: 'Tầm Quan Trọng Của Nước Đối Với Tập Luyện',
    summary: 'Uống nước đúng cách để tối ưu hiệu suất tập luyện.',
    tags: ['Sức khỏe', 'Nước', 'Tập luyện'],
    content: `# Nước và Hiệu Suất Tập Luyện

Mất chỉ 2% nước cơ thể có thể giảm hiệu suất tập luyện đến 25%.

## Công thức tính nước cần/ngày

**Lượng nước = Cân nặng (kg) × 35ml**

Ví dụ: 70kg × 35ml = 2,450ml ≈ 2.5 lít/ngày

## Quy tắc uống nước khi tập

- **2 giờ trước tập**: Uống 500ml
- **Trong khi tập**: 200ml mỗi 15-20 phút
- **Sau tập**: 500-700ml cho mỗi 0.5kg cân nặng mất đi

## Dấu hiệu thiếu nước

⚠️ Nước tiểu vàng đậm
⚠️ Đau đầu, chóng mặt
⚠️ Chuột rút khi tập
⚠️ Mệt mỏi bất thường`
  },
  {
    id: 'k05',
    title: 'Giấc Ngủ và Phục Hồi Cơ Bắp',
    summary: 'Vì sao ngủ đủ giấc là bí quyết tăng cơ giảm mỡ.',
    tags: ['Phục hồi', 'Giấc ngủ', 'Cơ bắp'],
    content: `# Ngủ - Vũ Khí Bí Mật Của Gymer

Cơ bắp KHÔNG phát triển khi bạn tập. Chúng phát triển khi bạn NGỦ.

## Điều gì xảy ra khi ngủ?

- **Giai đoạn NREM sâu**: Hormone tăng trưởng (HGH) tiết ra mạnh nhất
- **Giai đoạn REM**: Não xử lý kỹ năng vận động đã học
- **Cortisol giảm**: Hormone stress giảm, cơ thể chuyển sang chế độ phục hồi

## Thiếu ngủ ảnh hưởng gì?

| Giờ ngủ | Ảnh hưởng |
|---------|-----------|
| < 6 giờ | Giảm 60% testosterone, tăng mỡ bụng |
| 6-7 giờ | Phục hồi chậm, dễ chấn thương |
| 7-9 giờ | Tối ưu cho tập luyện |

## Tips ngủ ngon

🌙 Phòng tối, mát (18-20°C)
🌙 Không điện thoại 1 giờ trước ngủ
🌙 Magnesium/ZMA trước ngủ 30 phút
🌙 Ngủ và dậy cùng giờ mỗi ngày`
  },
];
