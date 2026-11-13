/** Draft curriculum: durations must be approved against the user's official schedule. */
export type Lesson = { id: string; title: string; minutes: number; objectives: string[] };
export const azTehlikeliCurriculum: Lesson[] = [
  { id: "mevzuat", title: "Çalışma mevzuatı ve çalışanların hak ve sorumlulukları", minutes: 60, objectives: ["Çalışanın hak ve yükümlülüklerini açıklar", "İSG kurallarına uyumun önemini kavrar"] },
  { id: "duzen", title: "İşyeri temizliği ve düzeni", minutes: 30, objectives: ["Düzenli çalışma alanı oluşturur"] },
  { id: "kazalar", title: "İş kazası ve meslek hastalığından doğan hukuki sonuçlar", minutes: 30, objectives: ["Olay bildirimini ve önleyici yaklaşımı açıklar"] },
  { id: "hastalik", title: "Meslek hastalıklarının sebepleri ve korunma", minutes: 45, objectives: ["Mesleki risk etkenlerini tanır"] },
  { id: "ergonomi", title: "Ergonomi ve çalışma ortamı riskleri", minutes: 60, objectives: ["Ergonomik çalışma ilkelerini uygular"] },
  { id: "ilk-yardim", title: "İlk yardım farkındalığı ve acil durumlar", minutes: 60, objectives: ["Acil durumlarda doğru bildirim yapar"] },
  { id: "yangin", title: "Yangın, tahliye ve acil durum prosedürleri", minutes: 60, objectives: ["Tahliye planını yorumlar"] },
  { id: "riskler", title: "Fiziksel, kimyasal, biyolojik ve psikososyal riskler", minutes: 75, objectives: ["Riskleri ve kontrol önlemlerini tanımlar"] },
  { id: "ekipman", title: "İş ekipmanları, ekranlı araçlar ve güvenli çalışma", minutes: 60, objectives: ["Güvenli ekipman kullanımı ilkelerini sayar"] }
];
export const curriculumMinutes = azTehlikeliCurriculum.reduce((sum, lesson) => sum + lesson.minutes, 0);
