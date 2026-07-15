export interface ThaiSubdistrict {
  name: string;
  zipcode: string;
}

export interface ThaiDistrict {
  name: string;
  subdistricts: ThaiSubdistrict[];
}

export interface ThaiProvince {
  name: string;
  districts: ThaiDistrict[];
}

export const thaiAddressData: ThaiProvince[] = [
  {
    name: "กรุงเทพมหานคร",
    districts: [
      {
        name: "เขตพระนคร",
        subdistricts: [
          { name: "พระบรมมหาราชวัง", zipcode: "10200" },
          { name: "วังบูรพาภิรมย์", zipcode: "10200" },
          { name: "วัดราชบพิตร", zipcode: "10200" },
          { name: "สำราญราษฎร์", zipcode: "10200" },
          { name: "ศาลเจ้าพ่อเสือ", zipcode: "10200" },
          { name: "บวรนิเวศ", zipcode: "10200" }
        ]
      },
      {
        name: "เขตปทุมวัน",
        subdistricts: [
          { name: "ปทุมวัน", zipcode: "10330" },
          { name: "รองเมือง", zipcode: "10330" },
          { name: "ลุมพินี", zipcode: "10330" },
          { name: "วังใหม่", zipcode: "10330" }
        ]
      },
      {
        name: "เขตบางรัก",
        subdistricts: [
          { name: "บางรัก", zipcode: "10500" },
          { name: "มหาพฤฒาราม", zipcode: "10500" },
          { name: "สีลม", zipcode: "10500" },
          { name: "สุริยวงศ์", zipcode: "10500" },
          { name: "สี่พระยา", zipcode: "10500" }
        ]
      },
      {
        name: "เขตจตุจักร",
        subdistricts: [
          { name: "จตุจักร", zipcode: "10900" },
          { name: "ลาดยาว", zipcode: "10900" },
          { name: "เสนานิคม", zipcode: "10900" },
          { name: "จันทรเกษม", zipcode: "10900" },
          { name: "จอมพล", zipcode: "10900" }
        ]
      },
      {
        name: "เขตห้วยขวาง",
        subdistricts: [
          { name: "ห้วยขวาง", zipcode: "10310" },
          { name: "บางกะปิ", zipcode: "10310" },
          { name: "สามเสนนอก", zipcode: "10310" }
        ]
      },
      {
        name: "เขตดินแดง",
        subdistricts: [
          { name: "ดินแดง", zipcode: "10400" }
        ]
      },
      {
        name: "เขตบางนา",
        subdistricts: [
          { name: "บางนาเหนือ", zipcode: "10260" },
          { name: "บางนาใต้", zipcode: "10260" }
        ]
      }
    ]
  },
  {
    name: "นนทบุรี",
    districts: [
      {
        name: "เมืองนนทบุรี",
        subdistricts: [
          { name: "สวนใหญ่", zipcode: "11000" },
          { name: "ตลาดขวัญ", zipcode: "11000" },
          { name: "บางเขน", zipcode: "11000" },
          { name: "บางกระสอ", zipcode: "11000" },
          { name: "ท่าทราย", zipcode: "11000" }
        ]
      },
      {
        name: "ปากเกร็ด",
        subdistricts: [
          { name: "ปากเกร็ด", zipcode: "11120" },
          { name: "บางตลาด", zipcode: "11120" },
          { name: "บ้านใหม่", zipcode: "11120" },
          { name: "คลองเกลือ", zipcode: "11120" }
        ]
      },
      {
        name: "บางบัวทอง",
        subdistricts: [
          { name: "บางบัวทอง", zipcode: "11110" },
          { name: "โสนลอย", zipcode: "11110" },
          { name: "พิมลราช", zipcode: "11110" }
        ]
      }
    ]
  },
  {
    name: "สมุทรปราการ",
    districts: [
      {
        name: "เมืองสมุทรปราการ",
        subdistricts: [
          { name: "ปากน้ำ", zipcode: "10270" },
          { name: "บางเมือง", zipcode: "10270" },
          { name: "ท้ายบ้าน", zipcode: "10280" },
          { name: "บางปู", zipcode: "10280" }
        ]
      },
      {
        name: "บางพลี",
        subdistricts: [
          { name: "บางพลีใหญ่", zipcode: "10540" },
          { name: "ราชาเทวะ", zipcode: "10540" },
          { name: "หนองปรือ", zipcode: "10540" }
        ]
      }
    ]
  },
  {
    name: "ปทุมธานี",
    districts: [
      {
        name: "คลองหลวง",
        subdistricts: [
          { name: "คลองหนึ่ง", zipcode: "12120" },
          { name: "คลองสอง", zipcode: "12120" },
          { name: "คลองสาม", zipcode: "12120" }
        ]
      },
      {
        name: "ธัญบุรี",
        subdistricts: [
          { name: "ประชาธิปัตย์", zipcode: "12130" },
          { name: "บึงยี่โถ", zipcode: "12130" },
          { name: "รังสิต", zipcode: "12110" }
        ]
      }
    ]
  },
  {
    name: "เชียงใหม่",
    districts: [
      {
        name: "เมืองเชียงใหม่",
        subdistricts: [
          { name: "ศรีภูมิ", zipcode: "50200" },
          { name: "พระสิงห์", zipcode: "50200" },
          { name: "ช้างคลาน", zipcode: "50100" },
          { name: "สุเทพ", zipcode: "50200" },
          { name: "ช้างเผือก", zipcode: "50300" }
        ]
      },
      {
        name: "หางดง",
        subdistricts: [
          { name: "หางดง", zipcode: "50230" },
          { name: "หนองแก๋ว", zipcode: "50230" }
        ]
      }
    ]
  },
  {
    name: "ชลบุรี",
    districts: [
      {
        name: "บางละมุง",
        subdistricts: [
          { name: "เมืองพัทยา", zipcode: "20150" },
          { name: "หนองปรือ", zipcode: "20150" },
          { name: "นาเกลือ", zipcode: "20150" },
          { name: "ห้วยใหญ่", zipcode: "20150" }
        ]
      },
      {
        name: "เมืองชลบุรี",
        subdistricts: [
          { name: "บางปลาสร้อย", zipcode: "20000" },
          { name: "แสนสุข", zipcode: "20130" },
          { name: "บ้านสวน", zipcode: "20000" }
        ]
      }
    ]
  },
  {
    name: "ขอนแก่น",
    districts: [
      {
        name: "เมืองขอนแก่น",
        subdistricts: [
          { name: "ในเมือง", zipcode: "40000" },
          { name: "ศิลา", zipcode: "40000" },
          { name: "บ้านเป็ด", zipcode: "40000" }
        ]
      }
    ]
  },
  {
    name: "นครราชสีมา",
    districts: [
      {
        name: "เมืองนครราชสีมา",
        subdistricts: [
          { name: "ในเมือง", zipcode: "30000" },
          { name: "จอหอ", zipcode: "30310" },
          { name: "หมื่นไวย", zipcode: "30000" }
        ]
      }
    ]
  },
  {
    name: "ภูเก็ต",
    districts: [
      {
        name: "เมืองภูเก็ต",
        subdistricts: [
          { name: "ตลาดใหญ่", zipcode: "83000" },
          { name: "ตลาดเหนือ", zipcode: "83000" },
          { name: "เกาะแก้ว", zipcode: "83000" }
        ]
      },
      {
        name: "กะทู้",
        subdistricts: [
          { name: "กะทู้", zipcode: "83120" },
          { name: "ป่าตอง", zipcode: "83150" }
        ]
      }
    ]
  },
  {
    name: "สงขลา",
    districts: [
      {
        name: "หาดใหญ่",
        subdistricts: [
          { name: "หาดใหญ่", zipcode: "90110" },
          { name: "คอหงส์", zipcode: "90110" },
          { name: "ควนลัง", zipcode: "90110" }
        ]
      }
    ]
  }
];
