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
    "name": "กรุงเทพมหานคร",
    "districts": [
      {
        "name": "เขตพระนคร",
        "subdistricts": [
          {
            "name": "พระบรมมหาราชวัง",
            "zipcode": "10200"
          },
          {
            "name": "วังบูรพาภิรมย์",
            "zipcode": "10200"
          },
          {
            "name": "วัดราชบพิตร",
            "zipcode": "10200"
          },
          {
            "name": "สำราญราษฎร์",
            "zipcode": "10200"
          },
          {
            "name": "ศาลเจ้าพ่อเสือ",
            "zipcode": "10200"
          },
          {
            "name": "บวรนิเวศ",
            "zipcode": "10200"
          },
          {
            "name": "สมเด็จเจ้าพระยา",
            "zipcode": "10600"
          },
          {
            "name": "ชนะสงคราม",
            "zipcode": "10200"
          },
          {
            "name": "ตลาดยอด",
            "zipcode": "10200"
          },
          {
            "name": "ศาลเจ้าพ่อเสือ",
            "zipcode": "10200"
          },
          {
            "name": "บวรนิเวศ",
            "zipcode": "10200"
          },
          {
            "name": "บางลำพู",
            "zipcode": "10200"
          }
        ]
      },
      {
        "name": "เขตดุสิต",
        "subdistricts": [
          {
            "name": "ดุสิต",
            "zipcode": "10300"
          },
          {
            "name": "วชิรพยาบาล",
            "zipcode": "10300"
          },
          {
            "name": "สวนจิตรลดา",
            "zipcode": "10300"
          },
          {
            "name": "สี่กั๊กเสาเทเวศร์",
            "zipcode": "10300"
          },
          {
            "name": "ถนนนครไชยศรี",
            "zipcode": "10300"
          }
        ]
      },
      {
        "name": "เขตหนองจอก",
        "subdistricts": [
          {
            "name": "กระทุ่มราย",
            "zipcode": "10530"
          },
          {
            "name": "หนองจอก",
            "zipcode": "10530"
          },
          {
            "name": "คลองสิบ",
            "zipcode": "10530"
          },
          {
            "name": "คลองสิบสอง",
            "zipcode": "10530"
          },
          {
            "name": "โคกแฝด",
            "zipcode": "10530"
          },
          {
            "name": "คู้ฝ้าย",
            "zipcode": "10530"
          }
        ]
      },
      {
        "name": "เขตบางรัก",
        "subdistricts": [
          {
            "name": "มหาพฤฒาราม",
            "zipcode": "10500"
          },
          {
            "name": "สีลม",
            "zipcode": "10500"
          },
          {
            "name": "สุริยวงศ์",
            "zipcode": "10500"
          },
          {
            "name": "บางรัก",
            "zipcode": "10500"
          },
          {
            "name": "สี่พระยา",
            "zipcode": "10500"
          }
        ]
      },
      {
        "name": "เขตบางเขน",
        "subdistricts": [
          {
            "name": "อนุสาวรีย์",
            "zipcode": "10220"
          },
          {
            "name": "ท่าแร้ง",
            "zipcode": "10220"
          }
        ]
      },
      {
        "name": "เขตบางกะปิ",
        "subdistricts": [
          {
            "name": "คลองจั่น",
            "zipcode": "10240"
          },
          {
            "name": "หัวหมาก",
            "zipcode": "10240"
          }
        ]
      },
      {
        "name": "เขตปทุมวัน",
        "subdistricts": [
          {
            "name": "รองเมือง",
            "zipcode": "10330"
          },
          {
            "name": "วังใหม่",
            "zipcode": "10330"
          },
          {
            "name": "ปทุมวัน",
            "zipcode": "10330"
          },
          {
            "name": "ลุมพินี",
            "zipcode": "10330"
          }
        ]
      },
      {
        "name": "เขตป้อมปราบศัตรูพ่าย",
        "subdistricts": [
          {
            "name": "ป้อมปราบ",
            "zipcode": "10100"
          },
          {
            "name": "วัดเทพศิรินทร์",
            "zipcode": "10100"
          },
          {
            "name": "คลองมหานาค",
            "zipcode": "10100"
          },
          {
            "name": "บ้านบาตร",
            "zipcode": "10100"
          },
          {
            "name": "วัดโสมนัส",
            "zipcode": "10100"
          }
        ]
      },
      {
        "name": "เขตพระโขนง",
        "subdistricts": [
          {
            "name": "บางจาก",
            "zipcode": "10260"
          }
        ]
      },
      {
        "name": "เขตมีนบุรี",
        "subdistricts": [
          {
            "name": "มีนบุรี",
            "zipcode": "10510"
          },
          {
            "name": "แสนแสบ",
            "zipcode": "10510"
          }
        ]
      },
      {
        "name": "เขตลาดกระบัง",
        "subdistricts": [
          {
            "name": "ลาดกระบัง",
            "zipcode": "10520"
          },
          {
            "name": "คลองสองต้นนุ่น",
            "zipcode": "10520"
          },
          {
            "name": "คลองสามประเวศ",
            "zipcode": "10520"
          },
          {
            "name": "ลำปลาทิว",
            "zipcode": "10520"
          },
          {
            "name": "ทับยาว",
            "zipcode": "10520"
          },
          {
            "name": "ขุมทอง",
            "zipcode": "10520"
          }
        ]
      },
      {
        "name": "เขตยานนาวา",
        "subdistricts": [
          {
            "name": "ช่องนนทรี",
            "zipcode": "10120"
          },
          {
            "name": "บางโพงพาง",
            "zipcode": "10120"
          }
        ]
      },
      {
        "name": "เขตสัมพันธวงศ์",
        "subdistricts": [
          {
            "name": "สัมพันธวงศ์",
            "zipcode": "10100"
          },
          {
            "name": "จักรวรรดิ",
            "zipcode": "10100"
          },
          {
            "name": "ตลาดน้อย",
            "zipcode": "10100"
          }
        ]
      },
      {
        "name": "เขตพญาไท",
        "subdistricts": [
          {
            "name": "สามเสนใน",
            "zipcode": "10400"
          }
        ]
      },
      {
        "name": "เขตธนบุรี",
        "subdistricts": [
          {
            "name": "วัดกัลยาณ์",
            "zipcode": "10600"
          },
          {
            "name": "หิรัญรูจี",
            "zipcode": "10600"
          },
          {
            "name": "บางยี่เรือ",
            "zipcode": "10600"
          },
          {
            "name": "บุคคโล",
            "zipcode": "10600"
          },
          {
            "name": "ตลาดพลู",
            "zipcode": "10600"
          },
          {
            "name": "ดาวขนอง",
            "zipcode": "10600"
          },
          {
            "name": "สำเหร่",
            "zipcode": "10600"
          }
        ]
      },
      {
        "name": "เขตบางกอกใหญ่",
        "subdistricts": [
          {
            "name": "วัดอรุณ",
            "zipcode": "10600"
          },
          {
            "name": "วัดท่าพระ",
            "zipcode": "10600"
          }
        ]
      },
      {
        "name": "เขตห้วยขวาง",
        "subdistricts": [
          {
            "name": "ห้วยขวาง",
            "zipcode": "10310"
          },
          {
            "name": "บางกะปิ",
            "zipcode": "10310"
          },
          {
            "name": "สามเสนนอก",
            "zipcode": "10310"
          }
        ]
      },
      {
        "name": "เขตคลองสาน",
        "subdistricts": [
          {
            "name": "สมเด็จเจ้าพระยา",
            "zipcode": "10600"
          },
          {
            "name": "คลองสาน",
            "zipcode": "10600"
          },
          {
            "name": "คลองต้นไทร",
            "zipcode": "10600"
          },
          {
            "name": "บางลำภูล่าง",
            "zipcode": "10600"
          }
        ]
      },
      {
        "name": "เขตตลิ่งชัน",
        "subdistricts": [
          {
            "name": "คลองชักพระ",
            "zipcode": "10170"
          },
          {
            "name": "ตลิ่งชัน",
            "zipcode": "10170"
          },
          {
            "name": "ฉิมพลี",
            "zipcode": "10170"
          },
          {
            "name": "บางพรม",
            "zipcode": "10170"
          },
          {
            "name": "บางระมาด",
            "zipcode": "10170"
          },
          {
            "name": "บางเชือกหนัง",
            "zipcode": "10170"
          }
        ]
      },
      {
        "name": "เขตบางกอกน้อย",
        "subdistricts": [
          {
            "name": "ศิริราช",
            "zipcode": "10700"
          },
          {
            "name": "บ้านช่างหล่อ",
            "zipcode": "10700"
          },
          {
            "name": "บางขุนนนท์",
            "zipcode": "10700"
          },
          {
            "name": "บางขุนศรี",
            "zipcode": "10700"
          },
          {
            "name": "อรุณอมรินทร์",
            "zipcode": "10700"
          }
        ]
      },
      {
        "name": "เขตบางขุนเทียน",
        "subdistricts": [
          {
            "name": "ท่าข้าม",
            "zipcode": "10150"
          },
          {
            "name": "แสมดำ",
            "zipcode": "10150"
          }
        ]
      },
      {
        "name": "เขตภาษีเจริญ",
        "subdistricts": [
          {
            "name": "บางหว้า",
            "zipcode": "10160"
          },
          {
            "name": "บางด้วน",
            "zipcode": "10160"
          },
          {
            "name": "บางจาก",
            "zipcode": "10160"
          },
          {
            "name": "บางแวก",
            "zipcode": "10160"
          },
          {
            "name": "คลองขวาง",
            "zipcode": "10160"
          },
          {
            "name": "ปากคลองภาษีเจริญ",
            "zipcode": "10160"
          },
          {
            "name": "คูหาสวรรค์",
            "zipcode": "10160"
          }
        ]
      },
      {
        "name": "เขตหนองแขม",
        "subdistricts": [
          {
            "name": "หนองแขม",
            "zipcode": "10160"
          },
          {
            "name": "หนองค้างพลู",
            "zipcode": "10160"
          }
        ]
      },
      {
        "name": "เขตราษฎร์บูรณะ",
        "subdistricts": [
          {
            "name": "ราษฎร์บูรณะ",
            "zipcode": "10140"
          },
          {
            "name": "บางปะกอก",
            "zipcode": "10140"
          }
        ]
      },
      {
        "name": "เขตบางพลัด",
        "subdistricts": [
          {
            "name": "บางพลัด",
            "zipcode": "10700"
          },
          {
            "name": "บางอ้อ",
            "zipcode": "10700"
          },
          {
            "name": "บางบำหรุ",
            "zipcode": "10700"
          },
          {
            "name": "บางยี่ขัน",
            "zipcode": "10700"
          }
        ]
      },
      {
        "name": "เขตดินแดง",
        "subdistricts": [
          {
            "name": "ดินแดง",
            "zipcode": "10400"
          },
          {
            "name": "รัชดาภิเษก",
            "zipcode": "10400"
          }
        ]
      },
      {
        "name": "เขตบึงกุ่ม",
        "subdistricts": [
          {
            "name": "คลองกุ่ม",
            "zipcode": "10240"
          },
          {
            "name": "นวลจันทร์",
            "zipcode": "10230"
          },
          {
            "name": "นวมินทร์",
            "zipcode": "10240"
          }
        ]
      },
      {
        "name": "เขตสาทร",
        "subdistricts": [
          {
            "name": "ทุ่งวัดดอน",
            "zipcode": "10120"
          },
          {
            "name": "ยานนาวา",
            "zipcode": "10120"
          },
          {
            "name": "ทุ่งมหาเมฆ",
            "zipcode": "10120"
          }
        ]
      },
      {
        "name": "เขตบางซื่อ",
        "subdistricts": [
          {
            "name": "บางซื่อ",
            "zipcode": "10800"
          },
          {
            "name": "วงศ์สว่าง",
            "zipcode": "10800"
          }
        ]
      },
      {
        "name": "เขตจตุจักร",
        "subdistricts": [
          {
            "name": "ลาดยาว",
            "zipcode": "10900"
          },
          {
            "name": "เสนานิคม",
            "zipcode": "10900"
          },
          {
            "name": "จันทรเกษม",
            "zipcode": "10900"
          },
          {
            "name": "จอมพล",
            "zipcode": "10900"
          },
          {
            "name": "จตุจักร",
            "zipcode": "10900"
          }
        ]
      },
      {
        "name": "เขตบางคอแหลม",
        "subdistricts": [
          {
            "name": "บางคอแหลม",
            "zipcode": "10120"
          },
          {
            "name": "วัดพระยาไกร",
            "zipcode": "10120"
          },
          {
            "name": "บางโคล่",
            "zipcode": "10120"
          }
        ]
      },
      {
        "name": "เขตประเวศ",
        "subdistricts": [
          {
            "name": "ประเวศ",
            "zipcode": "10250"
          },
          {
            "name": "หนองบอน",
            "zipcode": "10250"
          },
          {
            "name": "ดอกไม้",
            "zipcode": "10250"
          }
        ]
      },
      {
        "name": "เขตคลองเตย",
        "subdistricts": [
          {
            "name": "คลองเตย",
            "zipcode": "10110"
          },
          {
            "name": "คลองตัน",
            "zipcode": "10110"
          },
          {
            "name": "พระโขนง",
            "zipcode": "10110"
          }
        ]
      },
      {
        "name": "เขตสวนหลวง",
        "subdistricts": [
          {
            "name": "สวนหลวง",
            "zipcode": "10250"
          },
          {
            "name": "อ่อนนุช",
            "zipcode": "10250"
          },
          {
            "name": "พัฒนาการ",
            "zipcode": "10250"
          }
        ]
      },
      {
        "name": "เขตจอมทอง",
        "subdistricts": [
          {
            "name": "บางขุนเทียน",
            "zipcode": "10150"
          },
          {
            "name": "บางค้อ",
            "zipcode": "10150"
          },
          {
            "name": "บางมด",
            "zipcode": "10150"
          },
          {
            "name": "จอมทอง",
            "zipcode": "10150"
          }
        ]
      },
      {
        "name": "เขตดอนเมือง",
        "subdistricts": [
          {
            "name": "สีกัน",
            "zipcode": "10210"
          },
          {
            "name": "ดอนเมือง",
            "zipcode": "10210"
          },
          {
            "name": "สนามบิน",
            "zipcode": "10210"
          }
        ]
      },
      {
        "name": "เขตราชเทวี",
        "subdistricts": [
          {
            "name": "ทุ่งพญาไท",
            "zipcode": "10400"
          },
          {
            "name": "ถนนพญาไท",
            "zipcode": "10400"
          },
          {
            "name": "ถนนเพชรบุรี",
            "zipcode": "10400"
          },
          {
            "name": "มักกะสัน",
            "zipcode": "10400"
          }
        ]
      },
      {
        "name": "เขตลาดพร้าว",
        "subdistricts": [
          {
            "name": "ลาดพร้าว",
            "zipcode": "10230"
          },
          {
            "name": "จรเข้บัว",
            "zipcode": "10230"
          }
        ]
      },
      {
        "name": "เขตวัฒนา",
        "subdistricts": [
          {
            "name": "คลองเตยเหนือ",
            "zipcode": "10110"
          },
          {
            "name": "คลองตันเหนือ",
            "zipcode": "10110"
          },
          {
            "name": "พระโขนงเหนือ",
            "zipcode": "10110"
          }
        ]
      },
      {
        "name": "เขตบางแค",
        "subdistricts": [
          {
            "name": "บางแค",
            "zipcode": "10160"
          },
          {
            "name": "บางแคเหนือ",
            "zipcode": "10160"
          },
          {
            "name": "บางไผ่",
            "zipcode": "10160"
          },
          {
            "name": "หลักสอง",
            "zipcode": "10160"
          }
        ]
      },
      {
        "name": "เขตหลักสี่",
        "subdistricts": [
          {
            "name": "ทุ่งสองห้อง",
            "zipcode": "10210"
          },
          {
            "name": "ตลาดบางเขน",
            "zipcode": "10210"
          }
        ]
      },
      {
        "name": "เขตสายไหม",
        "subdistricts": [
          {
            "name": "สายไหม",
            "zipcode": "10220"
          },
          {
            "name": "ออเงิน",
            "zipcode": "10220"
          },
          {
            "name": "คลองถนน",
            "zipcode": "10220"
          }
        ]
      },
      {
        "name": "เขตคันนายาว",
        "subdistricts": [
          {
            "name": "คันนายาว",
            "zipcode": "10230"
          },
          {
            "name": "รามอินทรา",
            "zipcode": "10230"
          }
        ]
      },
      {
        "name": "เขตสะพานสูง",
        "subdistricts": [
          {
            "name": "สะพานสูง",
            "zipcode": "10240"
          },
          {
            "name": "ราษฎร์พัฒนา",
            "zipcode": "10240"
          },
          {
            "name": "ทับช้าง",
            "zipcode": "10250"
          }
        ]
      },
      {
        "name": "เขตวังทองหลาง",
        "subdistricts": [
          {
            "name": "วังทองหลาง",
            "zipcode": "10310"
          },
          {
            "name": "สะพานสอง",
            "zipcode": "10310"
          },
          {
            "name": "คลองเจ้าคุณสิงห์",
            "zipcode": "10310"
          },
          {
            "name": "พลับพลา",
            "zipcode": "10310"
          }
        ]
      },
      {
        "name": "เขตคลองสามวา",
        "subdistricts": [
          {
            "name": "สามวาตะวันตก",
            "zipcode": "10510"
          },
          {
            "name": "สามวาตะวันออก",
            "zipcode": "10510"
          },
          {
            "name": "บางชัน",
            "zipcode": "10510"
          },
          {
            "name": "ทรายกองดิน",
            "zipcode": "10510"
          },
          {
            "name": "ทรายกองดินใต้",
            "zipcode": "10510"
          }
        ]
      },
      {
        "name": "เขตบางนา",
        "subdistricts": [
          {
            "name": "บางนาเหนือ",
            "zipcode": "10260"
          },
          {
            "name": "บางนาใต้",
            "zipcode": "10260"
          }
        ]
      },
      {
        "name": "เขตทวีวัฒนา",
        "subdistricts": [
          {
            "name": "ทวีวัฒนา",
            "zipcode": "10170"
          },
          {
            "name": "ศาลาธรรมสพน์",
            "zipcode": "10170"
          }
        ]
      },
      {
        "name": "เขตทุ่งครุ",
        "subdistricts": [
          {
            "name": "บางมด",
            "zipcode": "10140"
          },
          {
            "name": "ทุ่งครุ",
            "zipcode": "10140"
          }
        ]
      },
      {
        "name": "เขตบางบอน",
        "subdistricts": [
          {
            "name": "บางบอนเหนือ",
            "zipcode": "10150"
          },
          {
            "name": "บางบอนใต้",
            "zipcode": "10150"
          },
          {
            "name": "คลองบางพราน",
            "zipcode": "10150"
          },
          {
            "name": "คลองบางบอน",
            "zipcode": "10150"
          }
        ]
      }
    ]
  },
  {
    "name": "นนทบุรี",
    "districts": [
      {
        "name": "เมืองนนทบุรี",
        "subdistricts": [
          {
            "name": "สวนใหญ่",
            "zipcode": "11000"
          },
          {
            "name": "ตลาดขวัญ",
            "zipcode": "11000"
          },
          {
            "name": "บางเขน",
            "zipcode": "11000"
          },
          {
            "name": "บางกระสอ",
            "zipcode": "11000"
          },
          {
            "name": "ท่าทราย",
            "zipcode": "11000"
          },
          {
            "name": "บางไผ่",
            "zipcode": "11000"
          },
          {
            "name": "บางศรีเมือง",
            "zipcode": "11000"
          },
          {
            "name": "บางกร่าง",
            "zipcode": "11000"
          },
          {
            "name": "ไทรม้า",
            "zipcode": "11000"
          },
          {
            "name": "บางรักน้อย",
            "zipcode": "11000"
          }
        ]
      },
      {
        "name": "บางกรวย",
        "subdistricts": [
          {
            "name": "วัดชลอ",
            "zipcode": "11130"
          },
          {
            "name": "บางกรวย",
            "zipcode": "11130"
          },
          {
            "name": "บางสีทอง",
            "zipcode": "11130"
          },
          {
            "name": "บางขนุน",
            "zipcode": "11130"
          },
          {
            "name": "บางขุนกอง",
            "zipcode": "11130"
          },
          {
            "name": "บางคูเวียง",
            "zipcode": "11130"
          },
          {
            "name": "มหาสวัสดิ์",
            "zipcode": "11130"
          },
          {
            "name": "ปลายบาง",
            "zipcode": "11130"
          },
          {
            "name": "ศาลากลาง",
            "zipcode": "11130"
          }
        ]
      },
      {
        "name": "บางใหญ่",
        "subdistricts": [
          {
            "name": "บางม่วง",
            "zipcode": "11140"
          },
          {
            "name": "บางแม่นาง",
            "zipcode": "11140"
          },
          {
            "name": "บางใหญ่",
            "zipcode": "11140"
          },
          {
            "name": "เสาธงหิน",
            "zipcode": "11140"
          },
          {
            "name": "บางเลน",
            "zipcode": "11140"
          },
          {
            "name": "บ้านใหม่",
            "zipcode": "11140"
          }
        ]
      },
      {
        "name": "ปากเกร็ด",
        "subdistricts": [
          {
            "name": "ปากเกร็ด",
            "zipcode": "11120"
          },
          {
            "name": "บางตลาด",
            "zipcode": "11120"
          },
          {
            "name": "บ้านใหม่",
            "zipcode": "11120"
          },
          {
            "name": "บางพูด",
            "zipcode": "11120"
          },
          {
            "name": "บางตะไนย์",
            "zipcode": "11120"
          },
          {
            "name": "คลองพระอุดม",
            "zipcode": "11120"
          },
          {
            "name": "ท่าอิฐ",
            "zipcode": "11120"
          },
          {
            "name": "เกาะเกร็ด",
            "zipcode": "11120"
          },
          {
            "name": "อ้อมเกร็ด",
            "zipcode": "11120"
          },
          {
            "name": "คลองข่อย",
            "zipcode": "11120"
          },
          {
            "name": "บางพลับ",
            "zipcode": "11120"
          },
          {
            "name": "คลองเกลือ",
            "zipcode": "11120"
          }
        ]
      },
      {
        "name": "ไทรน้อย",
        "subdistricts": [
          {
            "name": "ไทรน้อย",
            "zipcode": "11150"
          },
          {
            "name": "ราษฎร์นิยม",
            "zipcode": "11150"
          },
          {
            "name": "หนองเพรียง",
            "zipcode": "11150"
          },
          {
            "name": "ไทรใหญ่",
            "zipcode": "11150"
          },
          {
            "name": "ขุนศรี",
            "zipcode": "11150"
          },
          {
            "name": "คลองตาคล้าย",
            "zipcode": "11150"
          },
          {
            "name": "ทวีวัฒนา",
            "zipcode": "11150"
          }
        ]
      },
      {
        "name": "บางบัวทอง",
        "subdistricts": [
          {
            "name": "โสนลอย",
            "zipcode": "11110"
          },
          {
            "name": "บางบัวทอง",
            "zipcode": "11110"
          },
          {
            "name": "บางรักพัฒนา",
            "zipcode": "11110"
          },
          {
            "name": "บางรักใหญ่",
            "zipcode": "11110"
          },
          {
            "name": "บางคูรัด",
            "zipcode": "11110"
          },
          {
            "name": "ละหาร",
            "zipcode": "11110"
          },
          {
            "name": "ลำโพ",
            "zipcode": "11110"
          },
          {
            "name": "พิมลราช",
            "zipcode": "11110"
          }
        ]
      }
    ]
  },
  {
    "name": "ปทุมธานี",
    "districts": [
      {
        "name": "เมืองปทุมธานี",
        "subdistricts": [
          {
            "name": "บางปรอก",
            "zipcode": "12000"
          },
          {
            "name": "บ้านใหม่",
            "zipcode": "12000"
          },
          {
            "name": "บ้านกลาง",
            "zipcode": "12000"
          },
          {
            "name": "บ้านฉาง",
            "zipcode": "12000"
          },
          {
            "name": "บางหลวง",
            "zipcode": "12000"
          },
          {
            "name": "บางเดื่อ",
            "zipcode": "12000"
          },
          {
            "name": "บางพูด",
            "zipcode": "12000"
          },
          {
            "name": "บางพูน",
            "zipcode": "12000"
          },
          {
            "name": "บางกะดี",
            "zipcode": "12000"
          },
          {
            "name": "สวนพริกไทย",
            "zipcode": "12000"
          },
          {
            "name": "หลักหก",
            "zipcode": "12000"
          }
        ]
      },
      {
        "name": "คลองหลวง",
        "subdistricts": [
          {
            "name": "คลองหนึ่ง",
            "zipcode": "12120"
          },
          {
            "name": "คลองสอง",
            "zipcode": "12120"
          },
          {
            "name": "คลองสาม",
            "zipcode": "12120"
          },
          {
            "name": "คลองสี่",
            "zipcode": "12120"
          },
          {
            "name": "คลองห้า",
            "zipcode": "12120"
          },
          {
            "name": "คลองหก",
            "zipcode": "12120"
          },
          {
            "name": "คลองเจ็ด",
            "zipcode": "12120"
          }
        ]
      },
      {
        "name": "ธัญบุรี",
        "subdistricts": [
          {
            "name": "ประชาธิปัตย์",
            "zipcode": "12130"
          },
          {
            "name": "บึงยี่โถ",
            "zipcode": "12130"
          },
          {
            "name": "รังสิต",
            "zipcode": "12110"
          },
          {
            "name": "ลำผักกูด",
            "zipcode": "12110"
          },
          {
            "name": "บึงสนั่น",
            "zipcode": "12110"
          },
          {
            "name": "บึงน้ำรักษ์",
            "zipcode": "12110"
          }
        ]
      },
      {
        "name": "หนองเสือ",
        "subdistricts": [
          {
            "name": "บึงบา",
            "zipcode": "12170"
          },
          {
            "name": "บึงบอน",
            "zipcode": "12170"
          },
          {
            "name": "บึงกาสาม",
            "zipcode": "12170"
          },
          {
            "name": "บึงชำอ้อ",
            "zipcode": "12170"
          },
          {
            "name": "หนองสามวัง",
            "zipcode": "12170"
          },
          {
            "name": "ศาลาครุ",
            "zipcode": "12170"
          },
          {
            "name": "นพรัตน์",
            "zipcode": "12170"
          }
        ]
      },
      {
        "name": "ลาดหลุมแก้ว",
        "subdistricts": [
          {
            "name": "ระแหง",
            "zipcode": "12140"
          },
          {
            "name": "ลาดหลุมแก้ว",
            "zipcode": "12140"
          },
          {
            "name": "คูบางหลวง",
            "zipcode": "12140"
          },
          {
            "name": "คูขวาง",
            "zipcode": "12140"
          },
          {
            "name": "คลองพระอุดม",
            "zipcode": "12140"
          },
          {
            "name": "บ่อเงิน",
            "zipcode": "12140"
          },
          {
            "name": "หน้าไม้",
            "zipcode": "12140"
          }
        ]
      },
      {
        "name": "ลำลูกกา",
        "subdistricts": [
          {
            "name": "คูคต",
            "zipcode": "12130"
          },
          {
            "name": "ลาดสวาย",
            "zipcode": "12150"
          },
          {
            "name": "บึงคำพร้อย",
            "zipcode": "12150"
          },
          {
            "name": "ลำลูกกา",
            "zipcode": "12150"
          },
          {
            "name": "บึงทองหลาง",
            "zipcode": "12150"
          },
          {
            "name": "บึงคอหัก",
            "zipcode": "12150"
          },
          {
            "name": "พืชอุดม",
            "zipcode": "12150"
          }
        ]
      },
      {
        "name": "สามโคก",
        "subdistricts": [
          {
            "name": "บางเตย",
            "zipcode": "12160"
          },
          {
            "name": "คลองควาย",
            "zipcode": "12160"
          },
          {
            "name": "สามโคก",
            "zipcode": "12160"
          },
          {
            "name": "กระแชง",
            "zipcode": "12160"
          },
          {
            "name": "บางโพธิ์เหนือ",
            "zipcode": "12160"
          },
          {
            "name": "เชียงรากใหญ่",
            "zipcode": "12160"
          },
          {
            "name": "เชียงรากน้อย",
            "zipcode": "12160"
          },
          {
            "name": "บ้านปทุม",
            "zipcode": "12160"
          },
          {
            "name": "บ้านงิ้ว",
            "zipcode": "12160"
          },
          {
            "name": "เชียงรากน้อย",
            "zipcode": "12160"
          },
          {
            "name": "บางกระบือ",
            "zipcode": "12160"
          }
        ]
      }
    ]
  },
  {
    "name": "สมุทรปราการ",
    "districts": [
      {
        "name": "เมืองสมุทรปราการ",
        "subdistricts": [
          {
            "name": "ปากน้ำ",
            "zipcode": "10270"
          },
          {
            "name": "สำโรงเหนือ",
            "zipcode": "10270"
          },
          {
            "name": "บางเมือง",
            "zipcode": "10270"
          },
          {
            "name": "ท้ายบ้าน",
            "zipcode": "10280"
          },
          {
            "name": "บางปูใหม่",
            "zipcode": "10280"
          },
          {
            "name": "แพรกษา",
            "zipcode": "10280"
          },
          {
            "name": "บางเมืองใหม่",
            "zipcode": "10270"
          },
          {
            "name": "เทพารักษ์",
            "zipcode": "10270"
          },
          {
            "name": "ท้ายบ้านใหม่",
            "zipcode": "10280"
          },
          {
            "name": "แพรกษาใหม่",
            "zipcode": "10280"
          },
          {
            "name": "บางปู",
            "zipcode": "10280"
          },
          {
            "name": "บางปูเหนือ",
            "zipcode": "10280"
          }
        ]
      },
      {
        "name": "บางบ่อ",
        "subdistricts": [
          {
            "name": "บางบ่อ",
            "zipcode": "10560"
          },
          {
            "name": "บ้านระกาศ",
            "zipcode": "10560"
          },
          {
            "name": "บางพลีน้อย",
            "zipcode": "10560"
          },
          {
            "name": "บางเพรียง",
            "zipcode": "10560"
          },
          {
            "name": "คลองด่าน",
            "zipcode": "10550"
          },
          {
            "name": "คลองสวน",
            "zipcode": "10560"
          },
          {
            "name": "เปร็ง",
            "zipcode": "10560"
          },
          {
            "name": "คลองนิยมยตรา",
            "zipcode": "10560"
          }
        ]
      },
      {
        "name": "บางพลี",
        "subdistricts": [
          {
            "name": "บางพลีใหญ่",
            "zipcode": "10540"
          },
          {
            "name": "บางแก้ว",
            "zipcode": "10540"
          },
          {
            "name": "บางปลา",
            "zipcode": "10540"
          },
          {
            "name": "บางโฉลง",
            "zipcode": "10540"
          },
          {
            "name": "ราชาเทวะ",
            "zipcode": "10540"
          },
          {
            "name": "หนองปรือ",
            "zipcode": "10540"
          }
        ]
      },
      {
        "name": "พระประแดง",
        "subdistricts": [
          {
            "name": "ตลาด",
            "zipcode": "10130"
          },
          {
            "name": "บางพึ่ง",
            "zipcode": "10130"
          },
          {
            "name": "บางครุ",
            "zipcode": "10130"
          },
          {
            "name": "บางหญ้าแพรก",
            "zipcode": "10130"
          },
          {
            "name": "บางหัวเสือ",
            "zipcode": "10130"
          },
          {
            "name": "สำโรงใต้",
            "zipcode": "10130"
          },
          {
            "name": "สำโรง",
            "zipcode": "10130"
          },
          {
            "name": "สำโรงกลาง",
            "zipcode": "10130"
          },
          {
            "name": "บางกอบัว",
            "zipcode": "10130"
          },
          {
            "name": "บางกะเจ้า",
            "zipcode": "10130"
          },
          {
            "name": "บางน้ำผึ้ง",
            "zipcode": "10130"
          },
          {
            "name": "บางกระสอบ",
            "zipcode": "10130"
          },
          {
            "name": "บางยอ",
            "zipcode": "10130"
          },
          {
            "name": "ทรงคนอง",
            "zipcode": "10130"
          }
        ]
      },
      {
        "name": "พระสมุทรเจดีย์",
        "subdistricts": [
          {
            "name": "นาเกลือ",
            "zipcode": "10290"
          },
          {
            "name": "บ้านคลองสวน",
            "zipcode": "10290"
          },
          {
            "name": "แหลมฟ้าผ่า",
            "zipcode": "10290"
          },
          {
            "name": "ปากคลองบางปลากด",
            "zipcode": "10290"
          },
          {
            "name": "ในคลองบางปลากด",
            "zipcode": "10290"
          }
        ]
      },
      {
        "name": "บางเสาธง",
        "subdistricts": [
          {
            "name": "บางเสาธง",
            "zipcode": "10570"
          },
          {
            "name": "ศีรษะจรเข้น้อย",
            "zipcode": "10570"
          },
          {
            "name": "ศีรษะจรเข้ใหญ่",
            "zipcode": "10570"
          }
        ]
      }
    ]
  },
  {
    "name": "เชียงใหม่",
    "districts": [
      {
        "name": "เมืองเชียงใหม่",
        "subdistricts": [
          {
            "name": "ศรีภูมิ",
            "zipcode": "50200"
          },
          {
            "name": "พระสิงห์",
            "zipcode": "50200"
          },
          {
            "name": "หายยา",
            "zipcode": "50100"
          },
          {
            "name": "ช้างม่อย",
            "zipcode": "50300"
          },
          {
            "name": "ช้างคลาน",
            "zipcode": "50100"
          },
          {
            "name": "วัดเกต",
            "zipcode": "50000"
          },
          {
            "name": "ช้างเผือก",
            "zipcode": "50300"
          },
          {
            "name": "สุเทพ",
            "zipcode": "50200"
          },
          {
            "name": "แม่เหียะ",
            "zipcode": "50100"
          },
          {
            "name": "ป่าแดด",
            "zipcode": "50100"
          },
          {
            "name": "หนองหอย",
            "zipcode": "50000"
          },
          {
            "name": "ท่าศาลา",
            "zipcode": "50000"
          },
          {
            "name": "หนองป่าครั่ง",
            "zipcode": "50000"
          },
          {
            "name": "ฟ้าฮ่าม",
            "zipcode": "50000"
          },
          {
            "name": "ป่าตัน",
            "zipcode": "50300"
          },
          {
            "name": "สันผีเสื้อ",
            "zipcode": "50300"
          }
        ]
      },
      {
        "name": "จอมทอง",
        "subdistricts": [
          {
            "name": "บ้านหลวง",
            "zipcode": "50160"
          },
          {
            "name": "ข่วงเปา",
            "zipcode": "50160"
          },
          {
            "name": "สบเตี๊ยะ",
            "zipcode": "50160"
          },
          {
            "name": "บ้านแปะ",
            "zipcode": "50160"
          },
          {
            "name": "ดอยแก้ว",
            "zipcode": "50160"
          },
          {
            "name": "แม่สอย",
            "zipcode": "50160"
          }
        ]
      },
      {
        "name": "แม่ริม",
        "subdistricts": [
          {
            "name": "ริมเหนือ",
            "zipcode": "50180"
          },
          {
            "name": "ริมใต้",
            "zipcode": "50180"
          },
          {
            "name": "แม่สา",
            "zipcode": "50180"
          },
          {
            "name": "ดอนแก้ว",
            "zipcode": "50180"
          },
          {
            "name": "โป่งแยง",
            "zipcode": "50180"
          },
          {
            "name": "แม่แรม",
            "zipcode": "50180"
          },
          {
            "name": "ห้วยทราย",
            "zipcode": "50180"
          },
          {
            "name": "สะลวง",
            "zipcode": "50180"
          },
          {
            "name": "ขี้เหล็ก",
            "zipcode": "50180"
          }
        ]
      },
      {
        "name": "สารภี",
        "subdistricts": [
          {
            "name": "ยางเนิ้ง",
            "zipcode": "50140"
          },
          {
            "name": "สารภี",
            "zipcode": "50140"
          },
          {
            "name": "ชมภู",
            "zipcode": "50140"
          },
          {
            "name": "ไชยสถาน",
            "zipcode": "50140"
          },
          {
            "name": "ขัวมุง",
            "zipcode": "50140"
          },
          {
            "name": "หนองแฝก",
            "zipcode": "50140"
          },
          {
            "name": "หนองผึ้ง",
            "zipcode": "50140"
          },
          {
            "name": "ท่ากว้าง",
            "zipcode": "50140"
          },
          {
            "name": "ดอนแก้ว",
            "zipcode": "50140"
          },
          {
            "name": "ท่าวังตาล",
            "zipcode": "50140"
          },
          {
            "name": "สันทราย",
            "zipcode": "50140"
          },
          {
            "name": "ป่าบง",
            "zipcode": "50140"
          }
        ]
      },
      {
        "name": "สันทราย",
        "subdistricts": [
          {
            "name": "สันทรายหลวง",
            "zipcode": "50210"
          },
          {
            "name": "สันทรายน้อย",
            "zipcode": "50210"
          },
          {
            "name": "สันทรายงาม",
            "zipcode": "50210"
          },
          {
            "name": "หนองจ๊อม",
            "zipcode": "50210"
          },
          {
            "name": "หนองหาร",
            "zipcode": "50290"
          },
          {
            "name": "หนองแหย่ง",
            "zipcode": "50210"
          },
          {
            "name": "เมืองเล็น",
            "zipcode": "50210"
          },
          {
            "name": "ป่าไผ่",
            "zipcode": "50210"
          },
          {
            "name": "สำราญราษฎร์",
            "zipcode": "50210"
          },
          {
            "name": "แม่แฝก",
            "zipcode": "50290"
          },
          {
            "name": "แม่แฝกใหม่",
            "zipcode": "50290"
          },
          {
            "name": "เมืองแก้ว",
            "zipcode": "50210"
          }
        ]
      },
      {
        "name": "หางดง",
        "subdistricts": [
          {
            "name": "หางดง",
            "zipcode": "50230"
          },
          {
            "name": "หนองแก้ว",
            "zipcode": "50230"
          },
          {
            "name": "หารแก้ว",
            "zipcode": "50230"
          },
          {
            "name": "หนองตอง",
            "zipcode": "50230"
          },
          {
            "name": "ขุนแก้ว",
            "zipcode": "50230"
          },
          {
            "name": "สบแม่ข่า",
            "zipcode": "50230"
          },
          {
            "name": "บ้านป้าน",
            "zipcode": "50230"
          },
          {
            "name": "สันผักหวาน",
            "zipcode": "50230"
          },
          {
            "name": "หนองควาย",
            "zipcode": "50230"
          },
          {
            "name": "บ้านปง",
            "zipcode": "50230"
          },
          {
            "name": "น้ำแพร่",
            "zipcode": "50230"
          }
        ]
      }
    ]
  },
  {
    "name": "ชลบุรี",
    "districts": [
      {
        "name": "เมืองชลบุรี",
        "subdistricts": [
          {
            "name": "บางปลาสร้อย",
            "zipcode": "20000"
          },
          {
            "name": "มะขามหย่ง",
            "zipcode": "20000"
          },
          {
            "name": "บ้านโขด",
            "zipcode": "20000"
          },
          {
            "name": "แสนสุข",
            "zipcode": "20130"
          },
          {
            "name": "บ้านสวน",
            "zipcode": "20000"
          },
          {
            "name": "หนองรี",
            "zipcode": "20000"
          },
          {
            "name": "นาป่า",
            "zipcode": "20000"
          },
          {
            "name": "หนองข้างคอก",
            "zipcode": "20000"
          },
          {
            "name": "ดอนหัวฬ่อ",
            "zipcode": "20000"
          },
          {
            "name": "หนองไม้แดง",
            "zipcode": "20000"
          },
          {
            "name": "บางทราย",
            "zipcode": "20000"
          },
          {
            "name": "คลองตำหรุ",
            "zipcode": "20000"
          },
          {
            "name": "เหมือง",
            "zipcode": "20130"
          },
          {
            "name": "เสม็ด",
            "zipcode": "20000"
          },
          {
            "name": "อ่างศิลา",
            "zipcode": "20000"
          },
          {
            "name": "ห้วยกะปิ",
            "zipcode": "20000"
          }
        ]
      },
      {
        "name": "ศรีราชา",
        "subdistricts": [
          {
            "name": "ศรีราชา",
            "zipcode": "20110"
          },
          {
            "name": "สุรศักดิ์",
            "zipcode": "20110"
          },
          {
            "name": "ทุ่งสุขลา",
            "zipcode": "20230"
          },
          {
            "name": "บึง",
            "zipcode": "20230"
          },
          {
            "name": "หนองขาม",
            "zipcode": "20110"
          },
          {
            "name": "เขาคันทรง",
            "zipcode": "20110"
          },
          {
            "name": "บางพระ",
            "zipcode": "20110"
          },
          {
            "name": "บ่อวิน",
            "zipcode": "20230"
          }
        ]
      },
      {
        "name": "บางละมุง",
        "subdistricts": [
          {
            "name": "บางละมุง",
            "zipcode": "20150"
          },
          {
            "name": "หนองปรือ",
            "zipcode": "20150"
          },
          {
            "name": "หนองปลาไหล",
            "zipcode": "20150"
          },
          {
            "name": "โป่ง",
            "zipcode": "20150"
          },
          {
            "name": "เขาไม้แก้ว",
            "zipcode": "20150"
          },
          {
            "name": "ห้วยใหญ่",
            "zipcode": "20150"
          },
          {
            "name": "ตะเคียนเตี้ย",
            "zipcode": "20150"
          },
          {
            "name": "นาเกลือ",
            "zipcode": "20150"
          }
        ]
      },
      {
        "name": "สัตหีบ",
        "subdistricts": [
          {
            "name": "สัตหีบ",
            "zipcode": "20180"
          },
          {
            "name": "นาจอมเทียน",
            "zipcode": "20250"
          },
          {
            "name": "บางเสร่",
            "zipcode": "20250"
          },
          {
            "name": "พลูตาหลวง",
            "zipcode": "20180"
          },
          {
            "name": "แสมสาร",
            "zipcode": "20180"
          }
        ]
      }
    ]
  },
  {
    "name": "ขอนแก่น",
    "districts": [
      {
        "name": "เมืองขอนแก่น",
        "subdistricts": [
          {
            "name": "ในเมือง",
            "zipcode": "40000"
          },
          {
            "name": "สำราญ",
            "zipcode": "40000"
          },
          {
            "name": "โคกสี",
            "zipcode": "40000"
          },
          {
            "name": "ท่าพระ",
            "zipcode": "40260"
          },
          {
            "name": "บ้านทุ่ม",
            "zipcode": "40000"
          },
          {
            "name": "เมืองเก่า",
            "zipcode": "40000"
          },
          {
            "name": "พระลับ",
            "zipcode": "40000"
          },
          {
            "name": "สาวะถี",
            "zipcode": "40000"
          },
          {
            "name": "บ้านเป็ด",
            "zipcode": "40000"
          },
          {
            "name": "โนนท่อน",
            "zipcode": "40000"
          },
          {
            "name": "ศิลา",
            "zipcode": "40000"
          },
          {
            "name": "บ้านค้อ",
            "zipcode": "40000"
          }
        ]
      },
      {
        "name": "ชุมแพ",
        "subdistricts": [
          {
            "name": "ชุมแพ",
            "zipcode": "40130"
          },
          {
            "name": "โนนหัน",
            "zipcode": "40290"
          },
          {
            "name": "หนองไผ่",
            "zipcode": "40130"
          }
        ]
      },
      {
        "name": "บ้านไผ่",
        "subdistricts": [
          {
            "name": "บ้านไผ่",
            "zipcode": "40110"
          },
          {
            "name": "ในเมือง",
            "zipcode": "40110"
          },
          {
            "name": "เมืองพล",
            "zipcode": "40120"
          }
        ]
      }
    ]
  },
  {
    "name": "นครราชสีมา",
    "districts": [
      {
        "name": "เมืองนครราชสีมา",
        "subdistricts": [
          {
            "name": "ในเมือง",
            "zipcode": "30000"
          },
          {
            "name": "โพธิ์กลาง",
            "zipcode": "30000"
          },
          {
            "name": "หนองจะบก",
            "zipcode": "30000"
          },
          {
            "name": "โคกกรวด",
            "zipcode": "30280"
          },
          {
            "name": "สุรนารี",
            "zipcode": "30000"
          },
          {
            "name": "บ้านเกาะ",
            "zipcode": "30000"
          },
          {
            "name": "จอหอ",
            "zipcode": "30310"
          },
          {
            "name": "หัวทะเล",
            "zipcode": "30000"
          },
          {
            "name": "มะเริง",
            "zipcode": "30000"
          },
          {
            "name": "หนองบัวศาลา",
            "zipcode": "30000"
          }
        ]
      },
      {
        "name": "ปากช่อง",
        "subdistricts": [
          {
            "name": "ปากช่อง",
            "zipcode": "30130"
          },
          {
            "name": "หมูสี",
            "zipcode": "30130"
          },
          {
            "name": "หนองน้ำแดง",
            "zipcode": "30130"
          },
          {
            "name": "โป่งตาลอง",
            "zipcode": "30130"
          },
          {
            "name": "ขนงพระ",
            "zipcode": "30130"
          }
        ]
      }
    ]
  },
  {
    "name": "ภูเก็ต",
    "districts": [
      {
        "name": "เมืองภูเก็ต",
        "subdistricts": [
          {
            "name": "ตลาดใหญ่",
            "zipcode": "83000"
          },
          {
            "name": "ตลาดเหนือ",
            "zipcode": "83000"
          },
          {
            "name": "เกาะแก้ว",
            "zipcode": "83000"
          },
          {
            "name": "รัษฎา",
            "zipcode": "83000"
          },
          {
            "name": "วิชิต",
            "zipcode": "83000"
          },
          {
            "name": "ฉลอง",
            "zipcode": "83130"
          },
          {
            "name": "ราไวย์",
            "zipcode": "83130"
          },
          {
            "name": "กะรน",
            "zipcode": "83100"
          }
        ]
      },
      {
        "name": "กะทู้",
        "subdistricts": [
          {
            "name": "กะทู้",
            "zipcode": "83120"
          },
          {
            "name": "ป่าตอง",
            "zipcode": "83150"
          },
          {
            "name": "กมลา",
            "zipcode": "83150"
          }
        ]
      },
      {
        "name": "ถลาง",
        "subdistricts": [
          {
            "name": "เทพกระษัตรี",
            "zipcode": "83110"
          },
          {
            "name": "ศรีสุนทร",
            "zipcode": "83110"
          },
          {
            "name": "เชิงทะเล",
            "zipcode": "83110"
          },
          {
            "name": "ป่าคลอก",
            "zipcode": "83110"
          },
          {
            "name": "ไม้ขาว",
            "zipcode": "83110"
          },
          {
            "name": "สาคู",
            "zipcode": "83110"
          }
        ]
      }
    ]
  },
  {
    "name": "สงขลา",
    "districts": [
      {
        "name": "เมืองสงขลา",
        "subdistricts": [
          {
            "name": "บ่อยาง",
            "zipcode": "90000"
          },
          {
            "name": "เขารูปช้าง",
            "zipcode": "90000"
          },
          {
            "name": "เกาะแต้ว",
            "zipcode": "90000"
          },
          {
            "name": "พะวง",
            "zipcode": "90100"
          },
          {
            "name": "ทุ่งหวัง",
            "zipcode": "90000"
          },
          {
            "name": "เกาะยอ",
            "zipcode": "90100"
          }
        ]
      },
      {
        "name": "หาดใหญ่",
        "subdistricts": [
          {
            "name": "หาดใหญ่",
            "zipcode": "90110"
          },
          {
            "name": "คลองอู่ตะเภา",
            "zipcode": "90110"
          },
          {
            "name": "ควนลัง",
            "zipcode": "90110"
          },
          {
            "name": "คูเต้า",
            "zipcode": "90110"
          },
          {
            "name": "คอหงส์",
            "zipcode": "90110"
          },
          {
            "name": "คลองแห",
            "zipcode": "90110"
          },
          {
            "name": "บ้านพรุ",
            "zipcode": "90250"
          },
          {
            "name": "ทุ่งใหญ่",
            "zipcode": "90110"
          },
          {
            "name": "ท่าข้าม",
            "zipcode": "90110"
          },
          {
            "name": "น้ำน้อย",
            "zipcode": "90110"
          }
        ]
      }
    ]
  }
];
