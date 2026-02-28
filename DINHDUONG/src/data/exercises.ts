import { Exercise } from '@/types';

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
  { id:'b03', name:'Single Leg Deadlift', category:'balance', duration:10, caloriesBurned:50, youtubeId:'MVSrTPnMOTY', steps:['Đứng một chân, chân kia nhấc sau','Cúi người về trước, tay chạm đất','Giữ lưng thẳng','Trở về đứng thẳng, đổi chân'] },
  { id:'b04', name:'Tư thế đại bàng', category:'balance', duration:8, caloriesBurned:30, youtubeId:'bh_z6e-heSo', steps:['Đứng một chân, quấn chân kia','Hai tay đan chéo trước mặt','Hạ thấp hông, giữ thăng bằng','Giữ 20 giây, đổi bên'] },
  { id:'b05', name:'Đứng nhón gót', category:'balance', duration:5, caloriesBurned:20, youtubeId:'gwLzBJYoWlI', steps:['Đứng thẳng, hai chân sát','Nhón cao lên bằng mũi chân','Giữ 5 giây ở đỉnh','Hạ chậm xuống, lặp 15 lần'] },
  { id:'b06', name:'Side Plank', category:'balance', duration:6, caloriesBurned:35, youtubeId:'K2VljzCC16g', steps:['Nằm nghiêng, chống khuỷu tay','Nâng hông lên thẳng hàng','Tay trên vươn lên trời','Giữ 30 giây, đổi bên'] },
  { id:'b07', name:'Cầu một chân', category:'balance', duration:8, caloriesBurned:40, youtubeId:'AVAXhy6pl7o', steps:['Nằm ngửa, gối gập','Duỗi thẳng một chân lên','Nâng hông lên bằng chân còn lại','Giữ 3 giây, hạ xuống, đổi chân'] },
  { id:'b08', name:'Đi trên đường thẳng', category:'balance', duration:5, caloriesBurned:15, youtubeId:'q_RXP5pUTC8', steps:['Đi thẳng trên một đường kẻ','Gót chân chạm mũi chân trước','Mắt nhìn thẳng phía trước','Đi 20 bước, quay lại'] },
  { id:'b09', name:'Xoay người một chân', category:'balance', duration:8, caloriesBurned:30, youtubeId:'EoQXH_aQ10w', steps:['Đứng một chân, hơi gập gối','Xoay thân trên sang phải','Xoay sang trái','10 lần mỗi bên, đổi chân'] },
  { id:'b10', name:'Pistol Squat hỗ trợ', category:'balance', duration:10, caloriesBurned:55, youtubeId:'qDcniqddTeE', steps:['Đứng một chân, chân kia duỗi trước','Bám ghế/tường để hỗ trợ','Squat xuống chậm trên 1 chân','Đẩy lên, 5 lần mỗi chân'] },

  // ═══ REFLEX (Phản xạ) ═══
  { id:'x01', name:'Shadow Boxing', category:'reflex', duration:10, caloriesBurned:100, youtubeId:'HnwSL3huHqo', steps:['Tư thế boxing cơ bản','Ra đòn jab-cross liên tục','Phối hợp di chuyển chân','Né tránh đòn tưởng tượng'] },
  { id:'x02', name:'Bắt bóng phản xạ', category:'reflex', duration:10, caloriesBurned:60, youtubeId:'sPg-JyfUGWM', steps:['Đứng đối diện tường 2m','Ném bóng tennis vào tường','Bắt bóng nảy bằng 1 tay','Tăng tốc ném dần dần'] },
  { id:'x03', name:'Agility Ladder', category:'reflex', duration:10, caloriesBurned:90, youtubeId:'gy5oeVdG41c', steps:['Đặt thang dây trên sàn','Chạy nhanh bước vào từng ô','Đổi mẫu: 2 bước, bước chéo','Tăng tốc dần, giữ nhịp'] },
  { id:'x04', name:'Đá phản xạ', category:'reflex', duration:8, caloriesBurned:70, youtubeId:'5cS6GPkfsFQ', steps:['Tư thế chiến đấu','Đá roundhouse khi nghe hiệu lệnh','Đổi chân nhanh','Thu chân về tư thế phòng thủ'] },
  { id:'x05', name:'Nhảy dây tốc độ', category:'reflex', duration:8, caloriesBurned:110, youtubeId:'u3zgKRFc5-M', steps:['Cầm dây nhảy, tư thế sẵn sàng','Nhảy nhanh nhất có thể 30 giây','Nghỉ 15 giây','Lặp lại 5-8 hiệp'] },
  { id:'x06', name:'Phối hợp tay chân', category:'reflex', duration:10, caloriesBurned:65, youtubeId:'H0FO6HOLl14', steps:['Đứng thẳng','Tay phải chạm gối trái','Tay trái chạm gối phải','Tăng tốc dần, giữ nhịp'] },
  { id:'x07', name:'Phản xạ đèn (tưởng tượng)', category:'reflex', duration:8, caloriesBurned:55, youtubeId:'l7aFp1VJmzs', steps:['Đặt 4 vật ở 4 hướng','Người gọi hướng, bạn chạm nhanh','Trở về tâm sau mỗi lần','20 lần x 3 hiệp'] },
  { id:'x08', name:'Né tránh bóng', category:'reflex', duration:8, caloriesBurned:60, youtubeId:'4u_bWBmFsLg', steps:['Đứng cách tường 3m','Ném bóng vào tường','Né bóng nảy lại','Kết hợp bắt và né'] },
  { id:'x09', name:'Tap nhanh chân', category:'reflex', duration:6, caloriesBurned:70, youtubeId:'jz1Nq0L-6k0', steps:['Đặt 1 bóng/vật nhỏ trước mặt','Tap nhanh bằng mũi chân lên bóng','Đổi chân liên tục','30 giây x 4 hiệp'] },
  { id:'x10', name:'Speed Bag tưởng tượng', category:'reflex', duration:8, caloriesBurned:65, youtubeId:'u3b_viHxtzM', steps:['Hai tay nắm đấm ngang mặt','Xoay tay tròn đánh liên tục','Đổi tay dẫn mỗi 30 giây','Giữ nhịp nhanh, đều'] },
];
