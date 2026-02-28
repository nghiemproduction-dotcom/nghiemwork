import { Exercise, Meal, KnowledgeArticle, ExerciseCategory, MealCategory } from '@/types';

// Exercise data from DINHDUONG
export const exercises: Exercise[] = [
  // ═══ CARDIO (Nhịp điệu) ═══
  { id:'c01', name:'Chạy bộ tại chỗ', category:'cardio', duration:15, caloriesBurned:150, youtubeId:'gC_L9qAHVJ8', steps:['Đứng thẳng, hai chân rộng bằng vai','Bắt đầu chạy tại chỗ, nâng gối cao','Đánh tay nhịp nhàng theo bước chân','Duy trì nhịp đều, thở sâu'] },
  { id:'c02', name:'Nhảy dây', category:'cardio', duration:10, caloriesBurned:130, youtubeId:'FJmRQ5iTXKE', steps:['Cầm dây, hai tay ngang hông','Xoay cổ tay đưa dây qua đầu','Nhảy nhẹ bằng mũi chân','Giữ nhịp đều, không nhảy quá cao'] },
  { id:'c03', name:'Nhảy Jumping Jack', category:'cardio', duration:10, caloriesBurned:100, youtubeId:'CWpmIW6l-YA', steps:['Đứng thẳng, hai tay xuôi','Nhảy mở chân rộng, tay vung lên đầu','Nhảy trở về tư thế ban đầu','Lặp lại nhanh và đều'] },
  { id:'c04', name:'Đạp xe tại chỗ', category:'cardio', duration:20, caloriesBurned:200, youtubeId:'Ho2r_bWIRGc', steps:['Ngồi lên xe đạp tập','Điều chỉnh yên phù hợp','Bắt đầu đạp nhịp vừa','Tăng tốc dần sau 5 phút'] },
  { id:'c05', name:'Leo cầu thang', category:'cardio', duration:15, caloriesBurned:170, youtubeId:'dNq_gSgMJgk', steps:['Đứng trước bậc thang/step','Bước lên bằng chân phải','Bước lên chân trái, đứng thẳng','Bước xuống và đổi chân'] },
  { id:'c06', name:'Burpees', category:'cardio', duration:10, caloriesBurned:140, youtubeId:'dZgVxmf6jkA', steps:['Đứng thẳng, squat xuống','Chống tay, đẩy chân ra sau (plank)','Hít đất 1 cái','Nhảy chân về, đứng lên nhảy cao'] },
  { id:'c07', name:'High Knees', category:'cardio', duration:8, caloriesBurned:100, youtubeId:'tx5rgpDAJRI', steps:['Đứng thẳng, tay để ngang bụng','Nâng gối phải chạm tay','Đổi chân nhanh, nâng gối trái','Chạy nhanh tại chỗ nâng gối'] },
  { id:'c08', name:'Mountain Climbers', category:'cardio', duration:10, caloriesBurned:120, youtubeId:'nmwgirgXLYM', steps:['Vào tư thế plank cao','Kéo gối phải về ngực','Đổi chân nhanh, kéo gối trái','Giữ hông thấp, chạy nhanh'] },
  { id:'c09', name:'Nhảy Squat', category:'cardio', duration:10, caloriesBurned:130, youtubeId:'CVaEhXotL7M', steps:['Đứng rộng bằng vai','Squat xuống sâu','Bật nhảy lên cao','Tiếp đất nhẹ nhàng, squat tiếp'] },
  { id:'c10', name:'Đi bộ nhanh tại chỗ', category:'cardio', duration:20, caloriesBurned:120, youtubeId:'brFHyOtTwH4', steps:['Đứng thẳng, vai thả lỏng','Bước đi nhanh tại chỗ','Vung tay mạnh theo nhịp','Giữ nhịp thở đều đặn'] },

  // ═══ RESISTANCE (Kháng lực) ═══
  { id:'r01', name:'Hít đất (Push-up)', category:'resistance', duration:10, caloriesBurned:80, youtubeId:'IODxDxX7oi4', steps:['Chống tay rộng bằng vai','Hạ người xuống, ngực gần sàn','Đẩy lên về vị trí ban đầu','Giữ thân thẳng suốt bài'] },
  { id:'r02', name:'Squat cơ bản', category:'resistance', duration:12, caloriesBurned:90, youtubeId:'aclHkVaku9U', steps:['Đứng rộng bằng vai, mũi chân hơi xoay ngoài','Hạ mông xuống như ngồi ghế','Đùi song song mặt đất','Đẩy gót chân đứng lên'] },
  { id:'r03', name:'Lunge trước', category:'resistance', duration:12, caloriesBurned:85, youtubeId:'QOVaHwm-Q6U', steps:['Đứng thẳng, bước chân phải về trước','Hạ gối trái gần sàn','Đẩy chân phải trở lại','Đổi chân, lặp lại'] },
  { id:'r04', name:'Plank chống tay', category:'resistance', duration:5, caloriesBurned:40, youtubeId:'ASdvN_XEl_c', steps:['Chống hai tay rộng bằng vai','Duỗi thẳng chân ra sau','Giữ thân thẳng hàng','Siết cơ bụng, giữ 30-60 giây'] },
  { id:'r05', name:'Chống đẩy kim cương', category:'resistance', duration:8, caloriesBurned:70, youtubeId:'J0DnG1_S92I', steps:['Hai tay chụm hình kim cương dưới ngực','Hạ người xuống chậm','Đẩy lên, siết cơ tay sau','Giữ khuỷu tay sát thân'] },
  { id:'r06', name:'Squat sumo', category:'resistance', duration:10, caloriesBurned:80, youtubeId:'9ZuXKqRbT9k', steps:['Đứng rộng hơn vai, mũi chân xoay 45°','Hạ mông xuống sâu','Giữ lưng thẳng, ngực ưỡn','Đẩy lên bằng gót chân'] },
  { id:'r07', name:'Glute Bridge', category:'resistance', duration:10, caloriesBurned:60, youtubeId:'OUgsJ8-Vi0E', steps:['Nằm ngửa, gối gập 90°','Đẩy hông lên cao','Siết mông ở đỉnh 2 giây','Hạ xuống chậm, lặp lại'] },
  { id:'r08', name:'Superman', category:'resistance', duration:8, caloriesBurned:50, youtubeId:'z6PJMT2y8GQ', steps:['Nằm sấp, tay duỗi trước mặt','Nâng tay và chân lên khỏi sàn','Giữ 2-3 giây, siết lưng dưới','Hạ xuống chậm, lặp lại'] },
  { id:'r09', name:'Dips trên ghế', category:'resistance', duration:8, caloriesBurned:65, youtubeId:'0326dy_-CzM', steps:['Chống tay lên mép ghế phía sau','Chân duỗi ra trước','Hạ người xuống, gập khuỷu tay','Đẩy lên về vị trí ban đầu'] },
  { id:'r10', name:'Wall Sit', category:'resistance', duration:5, caloriesBurned:45, youtubeId:'y-wV4Venusw', steps:['Tựa lưng vào tường','Hạ người xuống tư thế ngồi ghế','Đùi song song mặt đất','Giữ nguyên 30-60 giây'] },

  // ═══ STATIC (Tĩnh) ═══
  { id:'s01', name:'Yoga tư thế chiến binh I', category:'static', duration:10, caloriesBurned:40, youtubeId:'k4qaVoAbeHM', steps:['Bước chân phải về trước, gối gập 90°','Chân sau duỗi thẳng','Hai tay vươn lên trời','Giữ 30 giây, đổi bên'] },
  { id:'s02', name:'Tư thế rắn hổ mang', category:'static', duration:8, caloriesBurned:30, youtubeId:'JDcdhTuycOI', steps:['Nằm sấp, hai tay cạnh ngực','Đẩy thân trên lên, mở ngực','Vai hạ xuống xa tai','Giữ 20-30 giây, thở sâu'] },
  { id:'s03', name:'Tư thế em bé (Child Pose)', category:'static', duration:5, caloriesBurned:15, youtubeId:'2MJGg-dUKh0', steps:['Quỳ gối, ngồi lên gót chân','Cúi người về phía trước','Tay duỗi ra phía trước trên sàn','Thả lỏng, thở sâu 1 phút'] },
  { id:'s04', name:'Tư thế chó úp mặt', category:'static', duration:8, caloriesBurned:35, youtubeId:'j97SSGsnCAQ', steps:['Từ tư thế bàn, nhấc gối lên','Đẩy hông lên cao tạo hình chữ V ngược','Ấn gót chân xuống sàn','Giữ 30 giây, thở đều'] },
  { id:'s05', name:'Kéo giãn Hamstring', category:'static', duration:8, caloriesBurned:20, youtubeId:'FDwpEdxZ4H4', steps:['Ngồi duỗi thẳng chân','Cúi người về phía trước','Tay chạm mũi chân','Giữ 30 giây mỗi bên'] },
  { id:'s06', name:'Thiền thở sâu', category:'static', duration:10, caloriesBurned:15, youtubeId:'inpok4MKVLM', steps:['Ngồi xếp bằng, lưng thẳng','Nhắm mắt, thở bằng bụng','Hít vào 4 giây, giữ 4 giây','Thở ra 6 giây, lặp lại'] },
  { id:'s07', name:'Tư thế cầu (Bridge hold)', category:'static', duration:8, caloriesBurned:30, youtubeId:'kTcklQ62oOc', steps:['Nằm ngửa, gối gập','Nâng hông lên tạo đường thẳng','Siết mông và cơ bụng','Giữ 30-45 giây'] },
  { id:'s08', name:'Kéo giãn vai', category:'static', duration:6, caloriesBurned:15, youtubeId:'SEdqd1n0cvg', steps:['Đưa tay phải qua ngực','Tay trái ôm khuỷu tay phải','Kéo nhẹ về phía ngực','Giữ 20 giây, đổi bên'] },
  { id:'s09', name:'Tư thế cây (Tree Pose)', category:'static', duration:8, caloriesBurned:25, youtubeId:'wdln9qWYloU', steps:['Đứng một chân, chân kia đặt lên đùi trong','Hai tay chắp trước ngực hoặc vươn lên','Tập trung nhìn 1 điểm cố định','Giữ 30 giây, đổi chân'] },
  { id:'s10', name:'Foam Rolling thả lỏng', category:'static', duration:10, caloriesBurned:20, youtubeId:'SxQkM4SN8N4', steps:['Đặt foam roller dưới bắp chân','Lăn chậm qua lại','Di chuyển lên đùi, lưng','Dừng ở điểm đau 20 giây'] },

  // ═══ BALANCE (Thăng bằng) ═══
  { id:'b01', name:'Đứng một chân', category:'balance', duration:5, caloriesBurned:20, youtubeId:'pFnfuOw8eIk', steps:['Đứng thẳng, nhấc chân phải','Giữ thăng bằng 30 giây','Nhắm mắt để tăng độ khó','Đổi chân, lặp lại'] },
  { id:'b02', name:'Bird Dog', category:'balance', duration:8, caloriesBurned:35, youtubeId:'wiFNA3sqjCA', steps:['Tư thế bàn (quỳ 4 điểm)','Duỗi tay phải và chân trái','Giữ thẳng hàng 3 giây','Đổi bên, lặp lại 10 lần'] },
  { id:'b03', name:'Single Leg Deadlift', category:'balance', duration:10, caloriesBurned:50, youtubeId:'MVSrTPnMOTY', steps:['Đứng một chân, chân kia nhấc sau','Cúi người về phía trước, tay chạm đất','Giữ lưng thẳng','Trở về đứng thẳng, đổi chân'] },
  { id:'b04', name:'Tư thế đại bàng', category:'balance', duration:8, caloriesBurned:30, youtubeId:'bh_z6e-heSo', steps:['Đứng một chân, quấn chân kia','Hai tay đan chéo trước mặt','Hạ thấp hông, giữ thăng bằng','Giữ 20 giây, đổi bên'] },
  { id:'b05', name:'Đứng nhón gót', category:'balance', duration:5, caloriesBurned:20, youtubeId:'gwLzBJYoWlI', steps:['Đứng thẳng, hai chân sát','Nhón cao lên bằng mũi chân','Giữ 5 giây ở đỉnh','Hạ chậm xuống, lặp 15 lần'] },
  { id:'b06', name:'Side Plank', category:'balance', duration:6, caloriesBurned:35, youtubeId:'K2VljzCC16g', steps:['Nằm nghiêng, chống khuỷu tay','Nâng hông lên thẳng hàng','Tay trên vươn lên trời','Giữ 30 giây, đổi bên'] },
  { id:'b07', name:'Cầu một chân', category:'balance', duration:8, caloriesBurned:40, youtubeId:'AVAXhy6pl7o', steps:['Nằm ngửa, gối gập','Duỗi thẳng một chân lên','Nâng hông lên bằng chân còn lại','Giữ 3 giây, hạ xuống, đổi chân'] },
  { id:'b08', name:'Đi trên đường thẳng', category:'balance', duration:5, caloriesBurned:15, youtubeId:'q_RXP5pUTC8', steps:['Đi thẳng trên một đường kẻ','Gót chân chạm mũi chân trước','Mắt nhìn thẳng phía trước','Đi 20 bước, quay lại'] },
  { id:'b09', name:'Xoay người một chân', category:'balance', duration:8, caloriesBurned:30, youtubeId:'EoQXH_aQ10w', steps:['Đứng một chân, hơi gập gối','Xoay thân trên sang phải','Xoay sang trái','10 lần mỗi bên, đổi chân'] },
  { id:'b10', name:'Pistol Squat hỗ trợ', category:'balance', duration:10, caloriesBurned:55, youtubeId:'qDcniqddTeE', steps:['Đứng một chân, chân kia duỗi trước','Bám ghế/tường để hỗ trợ','Squat xuống chậm trên 1 chân','Đẩy lên, 5 lần mỗi chân'] },

  // ═══ REFLEX (Phản xạ) ═══
  { id:'ref01', name:'Bắt bóng nảy', category:'reflex', duration:5, caloriesBurned:25, youtubeId:'dQw4F9BZcYI', steps:['Đứng rộng bằng vai','Ném bóng xuống đất','Bắt bóng khi nảy lên','Tăng tốc độ dần'] },
  { id:'ref02', name:'Box jumps', category:'reflex', duration:8, caloriesBurned:60, youtubeId:'kFJmRQ5iTXKE', steps:['Chuẩn bị hộp/step thấp','Nhảy lên hộp','Nhảy xuống nhẹ nhàng','Lặp lại nhanh'] },
  { id:'ref03', name:'Ladder drills', category:'reflex', duration:6, caloriesBurned:40, youtubeId:'CWpmIW6l-YA', steps:['Vẽ thang trên sàn','Bước nhanh qua các ô thang','Giữ thăng bằng','Đảo chiều'] },
  { id:'ref04', name:'Reaction ball', category:'reflex', duration:4, caloriesBurned:30, youtubeId:'nmwgirgXLYM', steps:['Đối mặt tường','Ném bóng vào tường','Bắt bóng khi phản hồi','Giảm khoảng cách'] },
  { id:'ref05', name:'Speed ladder', category:'reflex', duration:7, caloriesBurned:50, youtubeId:'CVaEhXotL7M', steps:['Đặt thang tốc độ','Chạy nhanh qua thang','Chạm chân vào mỗi ô','Thử các pattern khác'] },
];

// Meal data from DINHDUONG
export const meals: Meal[] = [
  // ═══ MÓN CHÍNH ═══
  { id:'mc01', name:'Phở bò', category:'main', calories:450, protein:25, carbs:55, fat:12, ingredients:['200g bánh phở tươi','150g thịt bò tái/chín','1 củ hành tây','Hành lá, ngò gai, giá đỗ','Gia vị: nước mắm, hạt nêm'], instructions:'Ninh xương bò 3-4 tiếng với gừng và hành nướng. Lọc nước dùng trong, nêm nếm vừa ăn. Trụng bánh phở qua nước sôi, xếp thịt bò lên trên, chan nước dùng sôi. Ăn kèm rau thơm và giá.', servingNote:'Cho 4 người, calo tính cho 1 phần' },
  { id:'mc02', name:'Bún riêu cua', category:'main', calories:380, protein:22, carbs:48, fat:10, ingredients:['200g bún tươi','100g riêu cua','Đậu phụ chiên','Cà chua, hành','Rau sống, mắm tôm'], instructions:'Xào cà chua với dầu, thêm nước dùng. Cho riêu cua vào khi nước sôi, nêm mắm tôm. Trụng bún, chan nước dùng, thêm đậu phụ và rau.', servingNote:'Cho 4 người, calo tính cho 1 phần' },
  { id:'mc03', name:'Cơm gà Hội An', category:'main', calories:520, protein:30, carbs:60, fat:16, ingredients:['200g cơm nghệ','150g gà xé','Hành phi, rau răm','Nước mắm gừng','Dưa leo, rau sống'], instructions:'Nấu cơm với nước luộc gà và nghệ cho vàng. Gà luộc chín xé nhỏ. Làm nước mắm gừng: pha mắm, đường, tỏi ớt, gừng. Xếp cơm ra đĩa, gà lên trên, rưới mỡ hành.', servingNote:'Cho 4 người, calo tính cho 1 phần' },
  { id:'mc04', name:'Bún chả Hà Nội', category:'main', calories:480, protein:28, carbs:50, fat:18, ingredients:['200g bún','150g thịt nướng (chả miếng + viên)','Nước mắm chua ngọt','Rau sống, dưa góp','Tỏi, ớt, chanh'], instructions:'Ướp thịt với sả, mắm, đường, tiêu. Nướng trên than hoa đến vàng thơm. Pha nước mắm: mắm, đường, giấm, tỏi ớt, nước lọc. Ăn bún chấm nước mắm kèm rau.', servingNote:'Cho 4 người, calo tính cho 1 phần' },
  { id:'mc05', name:'Cơm tấm sườn', category:'main', calories:550, protein:32, carbs:58, fat:20, ingredients:['200g cơm tấm','150g sườn nướng','Bì, chả, trứng ốp la','Đồ chua, dưa leo','Nước mắm pha'], instructions:'Nướng sườn đã ướp mắm, đường, tỏi, sả đến vàng cháy cạnh. Nấu cơm tấm hơi khô. Xếp đĩa: cơm, sườn, bì, chả, trứng. Rưới mỡ hành, ăn kèm nước mắm.', servingNote:'Cho 4 người, calo tính cho 1 phần' },

  // ═══ ĂN NHẸ ═══
  { id:'sn01', name:'Bánh mì thịt', category:'snack', calories:350, protein:15, carbs:40, fat:14, ingredients:['1 ổ bánh mì','50g pate, chả lụa','Dưa leo, đồ chua, ngò','Nước tương, ớt','Bơ (tùy chọn)'], instructions:'Nướng giòn bánh mì. Phết pate, xếp chả lụa, dưa leo, đồ chua, rau mùi. Thêm nước tương và ớt tùy khẩu vị.', servingNote:'1 ổ/người' },
  { id:'sn02', name:'Xôi xéo', category:'snack', calories:300, protein:8, carbs:52, fat:8, ingredients:['150g nếp','50g đậu xanh','Hành phi, mỡ hành','Muối, đường'], instructions:'Ngâm nếp 4 tiếng, hấp chín. Đậu xanh hấp, tán nhuyễn. Xếp xôi ra đĩa, rải đậu xanh, rưới mỡ hành phi.', servingNote:'Cho 4 người, calo tính cho 1 phần' },
  { id:'sn03', name:'Gỏi cuốn tôm thịt', category:'snack', calories:180, protein:14, carbs:20, fat:4, ingredients:['Bánh tráng','Tôm luộc, thịt heo','Bún, rau sống','Nước mắm pha/tương đậu'], instructions:'Nhúng bánh tráng nước ấm. Xếp rau, bún, thịt, tôm lên. Cuốn chặt tay. Chấm nước mắm chua ngọt hoặc tương đậu phộng.', servingNote:'Cho 4 người, calo tính cho 1 phần (2 cuốn)' },
  { id:'sn04', name:'Khoai lang luộc', category:'snack', calories:160, protein:3, carbs:38, fat:0, ingredients:['2 củ khoai lang','Muối','Nước'], instructions:'Rửa sạch khoai, để nguyên vỏ. Luộc trong nước muối loãng 20-25 phút đến khi mềm. Để nguội bớt, bóc vỏ ăn.', servingNote:'Cho 4 người, calo tính cho 1 phần' },
  { id:'sn05', name:'Sữa chua Hy Lạp', category:'snack', calories:120, protein:12, carbs:8, fat:4, ingredients:['150g sữa chua Hy Lạp','1 thìa mật ong','Hạt chia','Trái cây tươi'], instructions:'Cho sữa chua ra chén. Rưới mật ong, rắc hạt chia. Thêm trái cây cắt nhỏ lên trên.', servingNote:'1 phần/người' },

  // ═══ ĂN VẶT ═══
  { id:'tr01', name:'Hạt điều rang muối', category:'treat', calories:160, protein:5, carbs:9, fat:13, ingredients:['30g hạt điều','Muối hồng'], instructions:'Rang hạt điều lửa nhỏ 5-7 phút đến vàng thơm. Rắc chút muối hồng, để nguội.', servingNote:'1 nắm/người (30g)' },
  { id:'tr02', name:'Trái cây tổng hợp', category:'treat', calories:100, protein:1, carbs:25, fat:0, ingredients:['Táo, cam, nho','Dưa hấu, thanh long','Chanh dây (tùy mùa)'], instructions:'Rửa sạch, cắt miếng vừa ăn. Trộn chung trong tô. Có thể rắc chút muối ớt.', servingNote:'1 phần/người (200g)' },
  { id:'tr03', name:'Thanh Protein Bar', category:'treat', calories:200, protein:20, carbs:22, fat:7, ingredients:['1 thanh protein bar','(Mua sẵn)'], instructions:'Mở bao bì, ăn trực tiếp. Nên ăn sau tập luyện 30 phút.', servingNote:'1 thanh/người' },

  // ═══ BỔ SUNG ═══
  { id:'sp01', name:'Whey Protein', category:'supplement', calories:120, protein:24, carbs:3, fat:1, ingredients:['1 scoop whey protein','250ml nước/sữa'], instructions:'Cho 1 scoop whey vào bình lắc. Thêm 250ml nước lạnh hoặc sữa. Lắc đều 30 giây, uống sau tập 30 phút.', servingNote:'1 scoop/người' },
  { id:'sp02', name:'BCAA', category:'supplement', calories:10, protein:5, carbs:0, fat:0, ingredients:['1 scoop BCAA','300ml nước'], instructions:'Pha 1 scoop BCAA với nước lạnh. Uống trong khi tập luyện để giảm mỏi cơ.', servingNote:'1 scoop/người' },
  { id:'sp03', name:'Creatine Monohydrate', category:'supplement', calories:0, protein:0, carbs:0, fat:0, ingredients:['5g creatine','Nước hoặc nước ép'], instructions:'Pha 5g creatine với nước. Uống hàng ngày, bất kể có tập hay không. Nên uống với bữa ăn.', servingNote:'5g/người/ngày' },
];

// Knowledge articles from DINHDUONG
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

- Ít vận động: BMR × 1.2
- Vận động nhẹ: BMR × 1.375
- Vận động vừa: BMR × 1.55
- Vận động nhiều: BMR × 1.725
- Vận động rất nhiều: BMR × 1.9

## Mục tiêu calo

- Giảm cân: TDEE - 500 calo
- Tăng cân: TDEE + 500 calo
- Duy trì cân: TDEE`
  },
  {
    id: 'k03',
    title: 'Macro Nutrients - Protein, Carb, Fat',
    summary: 'Tỷ lệ vàng và cách tính toán macro cho mục tiêu sức khỏe.',
    tags: ['Dinh dưỡng', 'Macro', 'Protein'],
    content: `# Macro là gì?

Macro nutrients là 3 nhóm chất dinh dưỡng chính: Protein, Carbohydrate, Fat.

## Tỷ lệ khuyến nghị

**Duy trì cân:** 40% carb, 30% protein, 30% fat

**Giảm cân:** 35% carb, 40% protein, 25% fat

**Tăng cơ:** 45% carb, 35% protein, 20% fat

## Công thức tính

- Protein: 4 calo/g
- Carb: 4 calo/g  
- Fat: 9 calo/g

## Nguồn thực phẩm

**Protein:** Thịt, cá, trứng, sữa, đậu
**Carb:** Gạo, bánh mì, khoai, trái cây
**Fat:** Dầu, mỡ, hạt, bơ`
  }
];
