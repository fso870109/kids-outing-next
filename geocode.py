import json, urllib.request, urllib.parse, time

API_KEY = "AIzaSyAVMJSNHSqSiLKur8g7IRCicSUDxeAZe8Q"

spots = [
  {
    "id": 1,
    "name": "華泰 Outlet",
    "city": "桃園",
    "district": "中壢"
  },
  {
    "id": 2,
    "name": "X 水族館",
    "city": "桃園",
    "district": "中壢"
  },
  {
    "id": 3,
    "name": "巧克力共和國",
    "city": "桃園",
    "district": "八德"
  },
  {
    "id": 4,
    "name": "廣豐置地廣場",
    "city": "桃園",
    "district": "八德"
  },
  {
    "id": 5,
    "name": "藝文特區博物館群",
    "city": "桃園",
    "district": "桃園區"
  },
  {
    "id": 6,
    "name": "蕃薯藤溫泉會館",
    "city": "桃園",
    "district": "復興"
  },
  {
    "id": 7,
    "name": "IKEA 桃園",
    "city": "桃園",
    "district": "中壢"
  },
  {
    "id": 8,
    "name": "手信霧影城",
    "city": "桃園",
    "district": "龍潭"
  },
  {
    "id": 9,
    "name": "大溪老街",
    "city": "桃園",
    "district": "大溪"
  },
  {
    "id": 10,
    "name": "石門水庫",
    "city": "桃園",
    "district": "大溪"
  },
  {
    "id": 11,
    "name": "月眉落羽松",
    "city": "桃園",
    "district": "大溪"
  },
  {
    "id": 12,
    "name": "六福村主題遊樂園",
    "city": "桃園",
    "district": "關西"
  },
  {
    "id": 13,
    "name": "埔心牧場",
    "city": "桃園",
    "district": "楊梅"
  },
  {
    "id": 14,
    "name": "萌萌村",
    "city": "桃園",
    "district": "楊梅"
  },
  {
    "id": 15,
    "name": "虎頭山公園",
    "city": "桃園",
    "district": "桃園區"
  },
  {
    "id": 16,
    "name": "竹圍漁港",
    "city": "桃園",
    "district": "蘆竹"
  },
  {
    "id": 17,
    "name": "桃機看飛機",
    "city": "桃園",
    "district": "大園"
  },
  {
    "id": 18,
    "name": "綠隧騎腳踏車",
    "city": "桃園",
    "district": "新屋"
  },
  {
    "id": 19,
    "name": "拉拉山神木群",
    "city": "桃園",
    "district": "復興"
  },
  {
    "id": 20,
    "name": "小烏來天空步道",
    "city": "桃園",
    "district": "復興"
  },
  {
    "id": 21,
    "name": "小人國主題樂園",
    "city": "桃園",
    "district": "龍潭"
  },
  {
    "id": 22,
    "name": "龍潭大池",
    "city": "桃園",
    "district": "龍潭"
  },
  {
    "id": 23,
    "name": "老街溪河廊步道",
    "city": "桃園",
    "district": "中壢"
  },
  {
    "id": 24,
    "name": "台北市立動物園",
    "city": "台北",
    "district": "文山"
  },
  {
    "id": 25,
    "name": "台北市立天文館",
    "city": "台北",
    "district": "中山"
  },
  {
    "id": 26,
    "name": "國立故宮博物院",
    "city": "台北",
    "district": "士林"
  },
  {
    "id": 27,
    "name": "台北兒童新樂園",
    "city": "台北",
    "district": "士林"
  },
  {
    "id": 28,
    "name": "國立科學教育館",
    "city": "台北",
    "district": "士林"
  },
  {
    "id": 29,
    "name": "士林夜市",
    "city": "台北",
    "district": "士林"
  },
  {
    "id": 30,
    "name": "象山步道",
    "city": "台北",
    "district": "信義"
  },
  {
    "id": 31,
    "name": "台北101觀景台",
    "city": "台北",
    "district": "信義"
  },
  {
    "id": 32,
    "name": "國立台灣博物館",
    "city": "台北",
    "district": "中正"
  },
  {
    "id": 33,
    "name": "大安森林公園",
    "city": "台北",
    "district": "大安"
  },
  {
    "id": 34,
    "name": "淡水老街",
    "city": "台北",
    "district": "淡水"
  },
  {
    "id": 35,
    "name": "貓空纜車",
    "city": "台北",
    "district": "文山"
  },
  {
    "id": 36,
    "name": "北投溫泉博物館",
    "city": "台北",
    "district": "北投"
  },
  {
    "id": 37,
    "name": "迪化街",
    "city": "台北",
    "district": "大同"
  },
  {
    "id": 38,
    "name": "陽明山國家公園",
    "city": "台北",
    "district": "士林"
  },
  {
    "id": 39,
    "name": "關渡自然公園",
    "city": "台北",
    "district": "北投"
  },
  {
    "id": 40,
    "name": "剝皮寮歷史街區",
    "city": "台北",
    "district": "萬華"
  },
  {
    "id": 41,
    "name": "木柵動物園貓熊館",
    "city": "台北",
    "district": "文山"
  },
  {
    "id": 42,
    "name": "八里左岸腳踏車",
    "city": "台北",
    "district": "淡水"
  },
  {
    "id": 43,
    "name": "福州山公園",
    "city": "台北",
    "district": "大安"
  },
  {
    "id": 44,
    "name": "兒童新樂園遊船",
    "city": "台北",
    "district": "士林"
  },
  {
    "id": 45,
    "name": "台北自來水園區",
    "city": "台北",
    "district": "中正"
  },
  {
    "id": 46,
    "name": "野柳地質公園",
    "city": "新北",
    "district": "萬里"
  },
  {
    "id": 47,
    "name": "十分瀑布",
    "city": "新北",
    "district": "平溪"
  },
  {
    "id": 48,
    "name": "九份老街",
    "city": "新北",
    "district": "瑞芳"
  },
  {
    "id": 49,
    "name": "平溪放天燈",
    "city": "新北",
    "district": "平溪"
  },
  {
    "id": 50,
    "name": "烏來溫泉老街",
    "city": "新北",
    "district": "烏來"
  },
  {
    "id": 51,
    "name": "新店碧潭",
    "city": "新北",
    "district": "新店"
  },
  {
    "id": 52,
    "name": "三峽老街",
    "city": "新北",
    "district": "三峽"
  },
  {
    "id": 53,
    "name": "黃金博物館",
    "city": "新北",
    "district": "瑞芳"
  },
  {
    "id": 54,
    "name": "福隆海水浴場",
    "city": "新北",
    "district": "貢寮"
  },
  {
    "id": 55,
    "name": "林口三井 Outlet",
    "city": "新北",
    "district": "林口"
  },
  {
    "id": 56,
    "name": "新北市兒童藝術館",
    "city": "新北",
    "district": "板橋"
  },
  {
    "id": 57,
    "name": "鶯歌陶瓷博物館",
    "city": "新北",
    "district": "鶯歌"
  },
  {
    "id": 58,
    "name": "鶯歌老街",
    "city": "新北",
    "district": "鶯歌"
  },
  {
    "id": 59,
    "name": "深坑老街",
    "city": "新北",
    "district": "深坑"
  },
  {
    "id": 60,
    "name": "坪林茶業博物館",
    "city": "新北",
    "district": "坪林"
  },
  {
    "id": 61,
    "name": "淡水紅毛城",
    "city": "新北",
    "district": "淡水"
  },
  {
    "id": 62,
    "name": "十分老街",
    "city": "新北",
    "district": "平溪"
  },
  {
    "id": 63,
    "name": "石碇老街",
    "city": "新北",
    "district": "石碇"
  },
  {
    "id": 64,
    "name": "新北市立圖書館",
    "city": "新北",
    "district": "板橋"
  },
  {
    "id": 65,
    "name": "金山老街",
    "city": "新北",
    "district": "金山"
  },
  {
    "id": 66,
    "name": "翡翠水庫遊客中心",
    "city": "新北",
    "district": "新店"
  },
  {
    "id": 67,
    "name": "和平島地質公園",
    "city": "基隆",
    "district": "中正"
  },
  {
    "id": 68,
    "name": "基隆廟口夜市",
    "city": "基隆",
    "district": "仁愛"
  },
  {
    "id": 69,
    "name": "正濱漁港彩色屋",
    "city": "基隆",
    "district": "中正"
  },
  {
    "id": 70,
    "name": "國立海洋科技博物館",
    "city": "基隆",
    "district": "中山"
  },
  {
    "id": 71,
    "name": "基隆港夜景",
    "city": "基隆",
    "district": "中正"
  },
  {
    "id": 72,
    "name": "二沙灣砲台",
    "city": "基隆",
    "district": "中正"
  },
  {
    "id": 73,
    "name": "情人湖公園",
    "city": "基隆",
    "district": "暖暖"
  },
  {
    "id": 74,
    "name": "基隆市立文化中心",
    "city": "基隆",
    "district": "信義"
  },
  {
    "id": 75,
    "name": "獅球嶺砲台",
    "city": "基隆",
    "district": "仁愛"
  },
  {
    "id": 76,
    "name": "八斗子漁港",
    "city": "基隆",
    "district": "中正"
  },
  {
    "id": 77,
    "name": "潮境公園",
    "city": "基隆",
    "district": "中正"
  },
  {
    "id": 78,
    "name": "基隆雨都散步",
    "city": "基隆",
    "district": "仁愛"
  },
  {
    "id": 79,
    "name": "中正公園大佛",
    "city": "基隆",
    "district": "中正"
  },
  {
    "id": 80,
    "name": "安樂市場",
    "city": "基隆",
    "district": "安樂"
  },
  {
    "id": 81,
    "name": "南榮公墓生態步道",
    "city": "基隆",
    "district": "仁愛"
  },
  {
    "id": 82,
    "name": "基隆嶼登島",
    "city": "基隆",
    "district": "中正"
  },
  {
    "id": 83,
    "name": "外木山海岸",
    "city": "基隆",
    "district": "安樂"
  },
  {
    "id": 84,
    "name": "崁仔頂漁市",
    "city": "基隆",
    "district": "仁愛"
  },
  {
    "id": 85,
    "name": "碧砂漁港",
    "city": "基隆",
    "district": "中正"
  },
  {
    "id": 86,
    "name": "基隆市立游泳池",
    "city": "基隆",
    "district": "信義"
  },
  {
    "id": 87,
    "name": "宜蘭傳藝中心",
    "city": "宜蘭",
    "district": "五結"
  },
  {
    "id": 88,
    "name": "礁溪溫泉公園",
    "city": "宜蘭",
    "district": "礁溪"
  },
  {
    "id": 89,
    "name": "幾米公園",
    "city": "宜蘭",
    "district": "宜蘭市"
  },
  {
    "id": 90,
    "name": "冬山河親水公園",
    "city": "宜蘭",
    "district": "冬山"
  },
  {
    "id": 91,
    "name": "頭城農場",
    "city": "宜蘭",
    "district": "頭城"
  },
  {
    "id": 92,
    "name": "羅東夜市",
    "city": "宜蘭",
    "district": "羅東"
  },
  {
    "id": 93,
    "name": "羅東運動公園",
    "city": "宜蘭",
    "district": "羅東"
  },
  {
    "id": 94,
    "name": "綠舞觀光工廠",
    "city": "宜蘭",
    "district": "五結"
  },
  {
    "id": 95,
    "name": "武荖坑風景區",
    "city": "宜蘭",
    "district": "蘇澳"
  },
  {
    "id": 96,
    "name": "東澳粉鳥林漁港",
    "city": "宜蘭",
    "district": "蘇澳"
  },
  {
    "id": 97,
    "name": "梅花湖",
    "city": "宜蘭",
    "district": "冬山"
  },
  {
    "id": 98,
    "name": "蜡藝彩繪館",
    "city": "宜蘭",
    "district": "蘇澳"
  },
  {
    "id": 99,
    "name": "宜蘭縣史館",
    "city": "宜蘭",
    "district": "宜蘭市"
  },
  {
    "id": 100,
    "name": "二結穀倉稻農文化館",
    "city": "宜蘭",
    "district": "五結"
  },
  {
    "id": 101,
    "name": "蘇澳冷泉",
    "city": "宜蘭",
    "district": "蘇澳"
  },
  {
    "id": 102,
    "name": "南方澳漁港",
    "city": "宜蘭",
    "district": "蘇澳"
  },
  {
    "id": 103,
    "name": "橘之鄉蜜餞工廠",
    "city": "宜蘭",
    "district": "礁溪"
  },
  {
    "id": 104,
    "name": "宜蘭設治紀念館",
    "city": "宜蘭",
    "district": "宜蘭市"
  },
  {
    "id": 105,
    "name": "清溝農場",
    "city": "宜蘭",
    "district": "三星"
  },
  {
    "id": 106,
    "name": "大里海岸",
    "city": "宜蘭",
    "district": "頭城"
  },
  {
    "id": 107,
    "name": "龜山島登島",
    "city": "宜蘭",
    "district": "頭城"
  },
  {
    "id": 108,
    "name": "太魯閣國家公園",
    "city": "花蓮",
    "district": "秀林"
  },
  {
    "id": 109,
    "name": "七星潭",
    "city": "花蓮",
    "district": "新城"
  },
  {
    "id": 110,
    "name": "花蓮自強夜市",
    "city": "花蓮",
    "district": "花蓮市"
  },
  {
    "id": 111,
    "name": "壽豐雲山水",
    "city": "花蓮",
    "district": "壽豐"
  },
  {
    "id": 112,
    "name": "光復糖廠",
    "city": "花蓮",
    "district": "光復"
  },
  {
    "id": 113,
    "name": "鯉魚潭",
    "city": "花蓮",
    "district": "壽豐"
  },
  {
    "id": 114,
    "name": "花蓮石雕博物館",
    "city": "花蓮",
    "district": "花蓮市"
  },
  {
    "id": 115,
    "name": "縱谷花海",
    "city": "花蓮",
    "district": "富里"
  },
  {
    "id": 116,
    "name": "吉安慶修院",
    "city": "花蓮",
    "district": "吉安"
  },
  {
    "id": 117,
    "name": "北濱公園海岸",
    "city": "花蓮",
    "district": "花蓮市"
  },
  {
    "id": 118,
    "name": "花蓮縣文化局",
    "city": "花蓮",
    "district": "花蓮市"
  },
  {
    "id": 119,
    "name": "理想大地度假村",
    "city": "花蓮",
    "district": "壽豐"
  },
  {
    "id": 120,
    "name": "遠雄海洋公園",
    "city": "花蓮",
    "district": "壽豐"
  },
  {
    "id": 121,
    "name": "豐田移民村",
    "city": "花蓮",
    "district": "壽豐"
  },
  {
    "id": 122,
    "name": "六十石山金針花",
    "city": "花蓮",
    "district": "富里"
  },
  {
    "id": 123,
    "name": "瑞穗溫泉",
    "city": "花蓮",
    "district": "瑞穗"
  },
  {
    "id": 124,
    "name": "花蓮玉里麵",
    "city": "花蓮",
    "district": "玉里"
  },
  {
    "id": 125,
    "name": "奇美部落",
    "city": "花蓮",
    "district": "瑞穗"
  },
  {
    "id": 126,
    "name": "秀姑巒溪泛舟",
    "city": "花蓮",
    "district": "瑞穗"
  },
  {
    "id": 127,
    "name": "花蓮港濱歷史公園",
    "city": "花蓮",
    "district": "花蓮市"
  },
  {
    "id": 128,
    "name": "台東森林公園",
    "city": "台東",
    "district": "台東市"
  },
  {
    "id": 129,
    "name": "鹿野高台熱氣球",
    "city": "台東",
    "district": "鹿野"
  },
  {
    "id": 130,
    "name": "池上伯朗大道",
    "city": "台東",
    "district": "池上"
  },
  {
    "id": 131,
    "name": "台東史前博物館",
    "city": "台東",
    "district": "台東市"
  },
  {
    "id": 132,
    "name": "小野柳地質公園",
    "city": "台東",
    "district": "東河"
  },
  {
    "id": 133,
    "name": "關山環鎮腳踏車",
    "city": "台東",
    "district": "關山"
  },
  {
    "id": 134,
    "name": "綠島浮潛",
    "city": "台東",
    "district": "綠島"
  },
  {
    "id": 135,
    "name": "綠島朝日溫泉",
    "city": "台東",
    "district": "綠島"
  },
  {
    "id": 136,
    "name": "蘭嶼達悟族文化",
    "city": "台東",
    "district": "蘭嶼"
  },
  {
    "id": 137,
    "name": "初鹿牧場",
    "city": "台東",
    "district": "卑南"
  },
  {
    "id": 138,
    "name": "台東知本溫泉",
    "city": "台東",
    "district": "卑南"
  },
  {
    "id": 139,
    "name": "太麻里金針山",
    "city": "台東",
    "district": "太麻里"
  },
  {
    "id": 140,
    "name": "台東鐵花村",
    "city": "台東",
    "district": "台東市"
  },
  {
    "id": 141,
    "name": "富山護漁區",
    "city": "台東",
    "district": "東河"
  },
  {
    "id": 142,
    "name": "石生花飾品手作",
    "city": "台東",
    "district": "台東市"
  },
  {
    "id": 143,
    "name": "台東市區散步",
    "city": "台東",
    "district": "台東市"
  },
  {
    "id": 144,
    "name": "加路蘭遊憩區",
    "city": "台東",
    "district": "台東市"
  },
  {
    "id": 145,
    "name": "南迴公路風光",
    "city": "台東",
    "district": "達仁"
  },
  {
    "id": 146,
    "name": "大武漁港",
    "city": "台東",
    "district": "大武"
  },
  {
    "id": 147,
    "name": "卑南文化公園",
    "city": "台東",
    "district": "台東市"
  },
  {
    "id": 148,
    "name": "墾丁國家公園",
    "city": "屏東",
    "district": "恆春"
  },
  {
    "id": 149,
    "name": "國立海洋生物博物館",
    "city": "屏東",
    "district": "車城"
  },
  {
    "id": 150,
    "name": "小琉球浮潛",
    "city": "屏東",
    "district": "琉球"
  },
  {
    "id": 151,
    "name": "恆春古城",
    "city": "屏東",
    "district": "恆春"
  },
  {
    "id": 152,
    "name": "四重溪溫泉",
    "city": "屏東",
    "district": "車城"
  },
  {
    "id": 153,
    "name": "墾丁大街夜市",
    "city": "屏東",
    "district": "恆春"
  },
  {
    "id": 154,
    "name": "車城福安宮",
    "city": "屏東",
    "district": "車城"
  },
  {
    "id": 155,
    "name": "墾丁水域活動",
    "city": "屏東",
    "district": "恆春"
  },
  {
    "id": 156,
    "name": "旭海大草原",
    "city": "屏東",
    "district": "牡丹"
  },
  {
    "id": 157,
    "name": "里港香腸老街",
    "city": "屏東",
    "district": "里港"
  },
  {
    "id": 158,
    "name": "東港黑鮪魚季",
    "city": "屏東",
    "district": "東港"
  },
  {
    "id": 159,
    "name": "三地門原住民文化",
    "city": "屏東",
    "district": "三地門"
  },
  {
    "id": 160,
    "name": "佳冬古厝聚落",
    "city": "屏東",
    "district": "佳冬"
  },
  {
    "id": 161,
    "name": "萬巒豬腳老街",
    "city": "屏東",
    "district": "萬巒"
  },
  {
    "id": 162,
    "name": "潮州冬瓜露",
    "city": "屏東",
    "district": "潮州"
  },
  {
    "id": 163,
    "name": "龍磐公園",
    "city": "屏東",
    "district": "恆春"
  },
  {
    "id": 164,
    "name": "春吶音樂祭場地",
    "city": "屏東",
    "district": "恆春"
  },
  {
    "id": 165,
    "name": "屏東夜市",
    "city": "屏東",
    "district": "屏東市"
  },
  {
    "id": 166,
    "name": "大鵬灣帆船",
    "city": "屏東",
    "district": "東港"
  },
  {
    "id": 167,
    "name": "林邊牡蠣養殖",
    "city": "屏東",
    "district": "林邊"
  },
  {
    "id": 168,
    "name": "壽山動物園",
    "city": "高雄",
    "district": "鼓山"
  },
  {
    "id": 169,
    "name": "駁二藝術特區",
    "city": "高雄",
    "district": "鹽埕"
  },
  {
    "id": 170,
    "name": "義大遊樂世界",
    "city": "高雄",
    "district": "大樹"
  },
  {
    "id": 171,
    "name": "科工館",
    "city": "高雄",
    "district": "三民"
  },
  {
    "id": 172,
    "name": "旗津海水浴場",
    "city": "高雄",
    "district": "旗津"
  },
  {
    "id": 173,
    "name": "蓮池潭",
    "city": "高雄",
    "district": "左營"
  },
  {
    "id": 174,
    "name": "佛光山佛陀紀念館",
    "city": "高雄",
    "district": "大樹"
  },
  {
    "id": 175,
    "name": "愛河旁散步",
    "city": "高雄",
    "district": "苓雅"
  },
  {
    "id": 176,
    "name": "六合夜市",
    "city": "高雄",
    "district": "新興"
  },
  {
    "id": 177,
    "name": "高雄市立美術館",
    "city": "高雄",
    "district": "鼓山"
  },
  {
    "id": 178,
    "name": "旗山老街",
    "city": "高雄",
    "district": "旗山"
  },
  {
    "id": 179,
    "name": "茂林紫蝶幽谷",
    "city": "高雄",
    "district": "茂林"
  },
  {
    "id": 180,
    "name": "美濃客家文化館",
    "city": "高雄",
    "district": "美濃"
  },
  {
    "id": 181,
    "name": "橋頭糖廠",
    "city": "高雄",
    "district": "橋頭"
  },
  {
    "id": 182,
    "name": "高雄港遊船",
    "city": "高雄",
    "district": "鹽埕"
  },
  {
    "id": 183,
    "name": "打狗英國領事館",
    "city": "高雄",
    "district": "鼓山"
  },
  {
    "id": 184,
    "name": "鳳山老街",
    "city": "高雄",
    "district": "鳳山"
  },
  {
    "id": 185,
    "name": "衛武營國家藝術文化中心",
    "city": "高雄",
    "district": "鳳山"
  },
  {
    "id": 186,
    "name": "內惟埤文化園區",
    "city": "高雄",
    "district": "鼓山"
  },
  {
    "id": 187,
    "name": "夢時代購物中心",
    "city": "高雄",
    "district": "前鎮"
  },
  {
    "id": 188,
    "name": "漢神巨蛋",
    "city": "高雄",
    "district": "左營"
  },
  {
    "id": 189,
    "name": "岡山羊肉老街",
    "city": "高雄",
    "district": "岡山"
  },
  {
    "id": 190,
    "name": "奇美博物館",
    "city": "台南",
    "district": "仁德"
  },
  {
    "id": 191,
    "name": "安平古堡",
    "city": "台南",
    "district": "安平"
  },
  {
    "id": 192,
    "name": "四草綠色隧道",
    "city": "台南",
    "district": "安南"
  },
  {
    "id": 193,
    "name": "赤崁樓",
    "city": "台南",
    "district": "中西"
  },
  {
    "id": 194,
    "name": "虎頭埤風景區",
    "city": "台南",
    "district": "新化"
  },
  {
    "id": 195,
    "name": "安平老街",
    "city": "台南",
    "district": "安平"
  },
  {
    "id": 196,
    "name": "神農街夜景",
    "city": "台南",
    "district": "中西"
  },
  {
    "id": 197,
    "name": "土溝農村美術館",
    "city": "台南",
    "district": "後壁"
  },
  {
    "id": 198,
    "name": "關廟鳳梨節",
    "city": "台南",
    "district": "關廟"
  },
  {
    "id": 199,
    "name": "佳里糖廠",
    "city": "台南",
    "district": "佳里"
  },
  {
    "id": 200,
    "name": "台南孔廟",
    "city": "台南",
    "district": "中西"
  },
  {
    "id": 201,
    "name": "億載金城",
    "city": "台南",
    "district": "安平"
  },
  {
    "id": 202,
    "name": "官田菱角節",
    "city": "台南",
    "district": "官田"
  },
  {
    "id": 203,
    "name": "南科考古館",
    "city": "台南",
    "district": "新市"
  },
  {
    "id": 204,
    "name": "台南市美術館",
    "city": "台南",
    "district": "中西"
  },
  {
    "id": 205,
    "name": "延平郡王祠",
    "city": "台南",
    "district": "中西"
  },
  {
    "id": 206,
    "name": "七股鹽山",
    "city": "台南",
    "district": "七股"
  },
  {
    "id": 207,
    "name": "北門遊客中心",
    "city": "台南",
    "district": "北門"
  },
  {
    "id": 208,
    "name": "台南花園夜市",
    "city": "台南",
    "district": "北區"
  },
  {
    "id": 209,
    "name": "白河蓮花季",
    "city": "台南",
    "district": "白河"
  },
  {
    "id": 210,
    "name": "台南總爺藝文中心",
    "city": "台南",
    "district": "麻豆"
  },
  {
    "id": 211,
    "name": "仁德蔬果市場",
    "city": "台南",
    "district": "仁德"
  },
  {
    "id": 212,
    "name": "阿里山國家風景區",
    "city": "嘉義縣",
    "district": "阿里山"
  },
  {
    "id": 213,
    "name": "阿里山小火車",
    "city": "嘉義縣",
    "district": "阿里山"
  },
  {
    "id": 214,
    "name": "嘉義文化路夜市",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 215,
    "name": "布袋漁港海鮮",
    "city": "嘉義縣",
    "district": "布袋"
  },
  {
    "id": 216,
    "name": "嘉義市立棒球場",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 217,
    "name": "奮起湖老街",
    "city": "嘉義縣",
    "district": "竹崎"
  },
  {
    "id": 218,
    "name": "嘉義文化創意產業園區",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 219,
    "name": "台灣原住民文化園區",
    "city": "嘉義縣",
    "district": "番路"
  },
  {
    "id": 220,
    "name": "蘭潭水庫",
    "city": "嘉義市",
    "district": "嘉義市"
  },
  {
    "id": 221,
    "name": "北回歸線地標",
    "city": "嘉義縣",
    "district": "水上"
  },
  {
    "id": 222,
    "name": "嘉義農業試驗場",
    "city": "嘉義市",
    "district": "嘉義市"
  },
  {
    "id": 223,
    "name": "竹崎親水公園",
    "city": "嘉義縣",
    "district": "竹崎"
  },
  {
    "id": 224,
    "name": "朴子配天宮老街",
    "city": "嘉義縣",
    "district": "朴子"
  },
  {
    "id": 225,
    "name": "東石漁港",
    "city": "嘉義縣",
    "district": "東石"
  },
  {
    "id": 226,
    "name": "梅山太平老街",
    "city": "嘉義縣",
    "district": "梅山"
  },
  {
    "id": 227,
    "name": "嘉義公園",
    "city": "嘉義市",
    "district": "嘉義市"
  },
  {
    "id": 228,
    "name": "嘉義市立博物館",
    "city": "嘉義市",
    "district": "嘉義市"
  },
  {
    "id": 229,
    "name": "獨立山步道",
    "city": "嘉義縣",
    "district": "竹崎"
  },
  {
    "id": 230,
    "name": "大林慈濟醫院文化館",
    "city": "嘉義縣",
    "district": "大林"
  },
  {
    "id": 231,
    "name": "故宮南院",
    "city": "嘉義縣",
    "district": "太保"
  },
  {
    "id": 232,
    "name": "劍湖山世界",
    "city": "雲林",
    "district": "古坑"
  },
  {
    "id": 233,
    "name": "北港朝天宮老街",
    "city": "雲林",
    "district": "北港"
  },
  {
    "id": 234,
    "name": "古坑咖啡農場",
    "city": "雲林",
    "district": "古坑"
  },
  {
    "id": 235,
    "name": "斗六太平老街",
    "city": "雲林",
    "district": "斗六"
  },
  {
    "id": 236,
    "name": "成龍溼地生態",
    "city": "雲林",
    "district": "口湖"
  },
  {
    "id": 237,
    "name": "西螺大橋",
    "city": "雲林",
    "district": "西螺"
  },
  {
    "id": 238,
    "name": "虎尾布袋戲館",
    "city": "雲林",
    "district": "虎尾"
  },
  {
    "id": 239,
    "name": "雲林故事館",
    "city": "雲林",
    "district": "斗六"
  },
  {
    "id": 240,
    "name": "元長鄉農業體驗",
    "city": "雲林",
    "district": "元長"
  },
  {
    "id": 241,
    "name": "口湖牽罟體驗",
    "city": "雲林",
    "district": "口湖"
  },
  {
    "id": 242,
    "name": "北港糖廠",
    "city": "雲林",
    "district": "北港"
  },
  {
    "id": 243,
    "name": "台灣農業博覽會場地",
    "city": "雲林",
    "district": "虎尾"
  },
  {
    "id": 244,
    "name": "二崙老街",
    "city": "雲林",
    "district": "二崙"
  },
  {
    "id": 245,
    "name": "麥寮六輕工業區",
    "city": "雲林",
    "district": "麥寮"
  },
  {
    "id": 246,
    "name": "草嶺古道",
    "city": "雲林",
    "district": "林內"
  },
  {
    "id": 247,
    "name": "水林蕃薯節",
    "city": "雲林",
    "district": "水林"
  },
  {
    "id": 248,
    "name": "雲林海線自行車",
    "city": "雲林",
    "district": "台西"
  },
  {
    "id": 249,
    "name": "崙背歐洲街",
    "city": "雲林",
    "district": "崙背"
  },
  {
    "id": 250,
    "name": "台西觀海亭",
    "city": "雲林",
    "district": "台西"
  },
  {
    "id": 251,
    "name": "斗南玩具博物館",
    "city": "雲林",
    "district": "斗南"
  },
  {
    "id": 252,
    "name": "彰化八卦山大佛",
    "city": "彰化",
    "district": "彰化市"
  },
  {
    "id": 253,
    "name": "鹿港老街",
    "city": "彰化",
    "district": "鹿港"
  },
  {
    "id": 254,
    "name": "台灣玻璃館",
    "city": "彰化",
    "district": "鹿港"
  },
  {
    "id": 255,
    "name": "彰化扇形車庫",
    "city": "彰化",
    "district": "彰化市"
  },
  {
    "id": 256,
    "name": "田尾公路花園",
    "city": "彰化",
    "district": "田尾"
  },
  {
    "id": 257,
    "name": "溪湖糖廠",
    "city": "彰化",
    "district": "溪湖"
  },
  {
    "id": 258,
    "name": "花壇台灣民俗村",
    "city": "彰化",
    "district": "花壇"
  },
  {
    "id": 259,
    "name": "鹿港天后宮",
    "city": "彰化",
    "district": "鹿港"
  },
  {
    "id": 260,
    "name": "彰化縣立美術館",
    "city": "彰化",
    "district": "彰化市"
  },
  {
    "id": 261,
    "name": "二水老街",
    "city": "彰化",
    "district": "二水"
  },
  {
    "id": 262,
    "name": "北斗奠安宮老街",
    "city": "彰化",
    "district": "北斗"
  },
  {
    "id": 263,
    "name": "員林百果山",
    "city": "彰化",
    "district": "員林"
  },
  {
    "id": 264,
    "name": "彰化市區自行車",
    "city": "彰化",
    "district": "彰化市"
  },
  {
    "id": 265,
    "name": "社頭織襪觀光工廠",
    "city": "彰化",
    "district": "社頭"
  },
  {
    "id": 266,
    "name": "和美萬聖節",
    "city": "彰化",
    "district": "和美"
  },
  {
    "id": 267,
    "name": "芳苑潮間帶",
    "city": "彰化",
    "district": "芳苑"
  },
  {
    "id": 268,
    "name": "彰化縣兒童公園",
    "city": "彰化",
    "district": "彰化市"
  },
  {
    "id": 269,
    "name": "埔心牧野休閒農場",
    "city": "彰化",
    "district": "埔心"
  },
  {
    "id": 270,
    "name": "鹿港民俗文物館",
    "city": "彰化",
    "district": "鹿港"
  },
  {
    "id": 271,
    "name": "彰化夜市",
    "city": "彰化",
    "district": "彰化市"
  },
  {
    "id": 272,
    "name": "日月潭",
    "city": "南投",
    "district": "魚池"
  },
  {
    "id": 273,
    "name": "溪頭自然教育園區",
    "city": "南投",
    "district": "鹿谷"
  },
  {
    "id": 274,
    "name": "清境農場",
    "city": "南投",
    "district": "仁愛"
  },
  {
    "id": 275,
    "name": "奧萬大賞楓",
    "city": "南投",
    "district": "仁愛"
  },
  {
    "id": 276,
    "name": "集集小鎮",
    "city": "南投",
    "district": "集集"
  },
  {
    "id": 277,
    "name": "九族文化村",
    "city": "南投",
    "district": "魚池"
  },
  {
    "id": 278,
    "name": "埔里紹興酒廠",
    "city": "南投",
    "district": "埔里"
  },
  {
    "id": 279,
    "name": "日月老茶廠",
    "city": "南投",
    "district": "魚池"
  },
  {
    "id": 280,
    "name": "合歡山觀星",
    "city": "南投",
    "district": "仁愛"
  },
  {
    "id": 281,
    "name": "竹山竹藝博物館",
    "city": "南投",
    "district": "竹山"
  },
  {
    "id": 282,
    "name": "水里蛇窯",
    "city": "南投",
    "district": "水里"
  },
  {
    "id": 283,
    "name": "名間松柏嶺茶園",
    "city": "南投",
    "district": "名間"
  },
  {
    "id": 284,
    "name": "鹿谷凍頂烏龍茶區",
    "city": "南投",
    "district": "鹿谷"
  },
  {
    "id": 285,
    "name": "杉林溪森林遊樂區",
    "city": "南投",
    "district": "竹山"
  },
  {
    "id": 286,
    "name": "中台禪寺",
    "city": "南投",
    "district": "埔里"
  },
  {
    "id": 287,
    "name": "紙教堂",
    "city": "南投",
    "district": "埔里"
  },
  {
    "id": 288,
    "name": "埔里蝴蝶生態",
    "city": "南投",
    "district": "埔里"
  },
  {
    "id": 289,
    "name": "魚池紅茶故事館",
    "city": "南投",
    "district": "魚池"
  },
  {
    "id": 290,
    "name": "草屯工藝研究中心",
    "city": "南投",
    "district": "草屯"
  },
  {
    "id": 291,
    "name": "日月潭纜車",
    "city": "南投",
    "district": "魚池"
  },
  {
    "id": 292,
    "name": "眉溪部落",
    "city": "南投",
    "district": "仁愛"
  },
  {
    "id": 293,
    "name": "國立自然科學博物館",
    "city": "台中",
    "district": "北區"
  },
  {
    "id": 294,
    "name": "麗寶樂園",
    "city": "台中",
    "district": "后里"
  },
  {
    "id": 295,
    "name": "彩虹眷村",
    "city": "台中",
    "district": "南屯"
  },
  {
    "id": 296,
    "name": "台中歌劇院",
    "city": "台中",
    "district": "西屯"
  },
  {
    "id": 297,
    "name": "科博館植物園",
    "city": "台中",
    "district": "北區"
  },
  {
    "id": 298,
    "name": "逢甲夜市",
    "city": "台中",
    "district": "西屯"
  },
  {
    "id": 299,
    "name": "大坑步道群",
    "city": "台中",
    "district": "北屯"
  },
  {
    "id": 300,
    "name": "台中市立動物園",
    "city": "台中",
    "district": "北屯"
  },
  {
    "id": 301,
    "name": "后豐鐵馬道",
    "city": "台中",
    "district": "豐原"
  },
  {
    "id": 302,
    "name": "新社花海",
    "city": "台中",
    "district": "新社"
  },
  {
    "id": 303,
    "name": "清水眷村文化園區",
    "city": "台中",
    "district": "清水"
  },
  {
    "id": 304,
    "name": "梧棲觀光魚市",
    "city": "台中",
    "district": "梧棲"
  },
  {
    "id": 305,
    "name": "東勢客家文化館",
    "city": "台中",
    "district": "東勢"
  },
  {
    "id": 306,
    "name": "台中公園",
    "city": "台中",
    "district": "中區"
  },
  {
    "id": 307,
    "name": "豐原廟東夜市",
    "city": "台中",
    "district": "豐原"
  },
  {
    "id": 308,
    "name": "大甲鎮瀾宮",
    "city": "台中",
    "district": "大甲"
  },
  {
    "id": 309,
    "name": "三義木雕博物館",
    "city": "台中",
    "district": "三義"
  },
  {
    "id": 310,
    "name": "日月千禧溫泉",
    "city": "台中",
    "district": "北屯"
  },
  {
    "id": 311,
    "name": "草悟道",
    "city": "台中",
    "district": "西區"
  },
  {
    "id": 312,
    "name": "審計新村",
    "city": "台中",
    "district": "西區"
  },
  {
    "id": 313,
    "name": "烏日高鐵探索館",
    "city": "台中",
    "district": "烏日"
  },
  {
    "id": 314,
    "name": "東海大學路思義教堂",
    "city": "台中",
    "district": "西屯"
  },
  {
    "id": 315,
    "name": "飛牛牧場",
    "city": "苗栗",
    "district": "通霄"
  },
  {
    "id": 316,
    "name": "三義木雕街",
    "city": "苗栗",
    "district": "三義"
  },
  {
    "id": 317,
    "name": "南庄老街",
    "city": "苗栗",
    "district": "南庄"
  },
  {
    "id": 318,
    "name": "獅頭山風景區",
    "city": "苗栗",
    "district": "南庄"
  },
  {
    "id": 319,
    "name": "客家文化園區",
    "city": "苗栗",
    "district": "銅鑼"
  },
  {
    "id": 320,
    "name": "大湖草莓農場",
    "city": "苗栗",
    "district": "大湖"
  },
  {
    "id": 321,
    "name": "龍騰斷橋",
    "city": "苗栗",
    "district": "三義"
  },
  {
    "id": 322,
    "name": "通霄精鹽廠",
    "city": "苗栗",
    "district": "通霄"
  },
  {
    "id": 323,
    "name": "苑裡藺草文化館",
    "city": "苗栗",
    "district": "苑裡"
  },
  {
    "id": 324,
    "name": "泰安溫泉",
    "city": "苗栗",
    "district": "泰安"
  },
  {
    "id": 325,
    "name": "頭份尚順育樂世界",
    "city": "苗栗",
    "district": "頭份"
  },
  {
    "id": 326,
    "name": "西湖渡假村",
    "city": "苗栗",
    "district": "三灣"
  },
  {
    "id": 327,
    "name": "卓蘭花卉農場",
    "city": "苗栗",
    "district": "卓蘭"
  },
  {
    "id": 328,
    "name": "明德水庫",
    "city": "苗栗",
    "district": "頭屋"
  },
  {
    "id": 329,
    "name": "苗栗縣立圖書館",
    "city": "苗栗",
    "district": "苗栗市"
  },
  {
    "id": 330,
    "name": "竹南蛇窯",
    "city": "苗栗",
    "district": "竹南"
  },
  {
    "id": 331,
    "name": "後龍好望角",
    "city": "苗栗",
    "district": "後龍"
  },
  {
    "id": 332,
    "name": "海寶樂園",
    "city": "苗栗",
    "district": "後龍"
  },
  {
    "id": 333,
    "name": "關刀山步道",
    "city": "苗栗",
    "district": "三義"
  },
  {
    "id": 334,
    "name": "頭份市運動公園",
    "city": "苗栗",
    "district": "頭份"
  },
  {
    "id": 335,
    "name": "新竹動物園",
    "city": "新竹市",
    "district": "東區"
  },
  {
    "id": 336,
    "name": "內灣老街",
    "city": "新竹縣",
    "district": "橫山"
  },
  {
    "id": 337,
    "name": "北埔老街",
    "city": "新竹縣",
    "district": "北埔"
  },
  {
    "id": 338,
    "name": "尖石鄉那羅部落",
    "city": "新竹縣",
    "district": "尖石"
  },
  {
    "id": 339,
    "name": "青青草原",
    "city": "新竹縣",
    "district": "峨眉"
  },
  {
    "id": 340,
    "name": "新竹市立美術館",
    "city": "新竹市",
    "district": "東區"
  },
  {
    "id": 341,
    "name": "玻璃工藝博物館",
    "city": "新竹市",
    "district": "東區"
  },
  {
    "id": 342,
    "name": "新竹城隍廟老街",
    "city": "新竹市",
    "district": "北區"
  },
  {
    "id": 343,
    "name": "新竹科學博物館",
    "city": "新竹市",
    "district": "東區"
  },
  {
    "id": 344,
    "name": "竹東夜市",
    "city": "新竹縣",
    "district": "竹東"
  },
  {
    "id": 345,
    "name": "新豐紅樹林",
    "city": "新竹縣",
    "district": "新豐"
  },
  {
    "id": 346,
    "name": "關西老街",
    "city": "新竹縣",
    "district": "關西"
  },
  {
    "id": 347,
    "name": "峨眉湖步道",
    "city": "新竹縣",
    "district": "峨眉"
  },
  {
    "id": 348,
    "name": "新竹市立棒球場",
    "city": "新竹市",
    "district": "北區"
  },
  {
    "id": 349,
    "name": "新竹17公里海岸線",
    "city": "新竹市",
    "district": "香山"
  },
  {
    "id": 350,
    "name": "苦花魚溼地",
    "city": "新竹縣",
    "district": "芎林"
  },
  {
    "id": 351,
    "name": "新竹孔廟",
    "city": "新竹市",
    "district": "東區"
  },
  {
    "id": 352,
    "name": "竹北高鐵特區",
    "city": "新竹市",
    "district": "竹北"
  },
  {
    "id": 353,
    "name": "新埔柿餅老街",
    "city": "新竹縣",
    "district": "新埔"
  },
  {
    "id": 354,
    "name": "合興車站",
    "city": "新竹縣",
    "district": "橫山"
  },
  {
    "id": 355,
    "name": "澎湖水族館",
    "city": "澎湖",
    "district": "馬公"
  },
  {
    "id": 356,
    "name": "澎湖天后宮老街",
    "city": "澎湖",
    "district": "馬公"
  },
  {
    "id": 357,
    "name": "澎湖跳島浮潛",
    "city": "澎湖",
    "district": "望安"
  },
  {
    "id": 358,
    "name": "菊島花火節",
    "city": "澎湖",
    "district": "馬公"
  },
  {
    "id": 359,
    "name": "通梁大榕樹",
    "city": "澎湖",
    "district": "白沙"
  },
  {
    "id": 360,
    "name": "小門地質館",
    "city": "澎湖",
    "district": "白沙"
  },
  {
    "id": 361,
    "name": "七美雙心石滬",
    "city": "澎湖",
    "district": "七美"
  },
  {
    "id": 362,
    "name": "吉貝島沙灘",
    "city": "澎湖",
    "district": "白沙"
  },
  {
    "id": 363,
    "name": "澎湖海底郵局",
    "city": "澎湖",
    "district": "馬公"
  },
  {
    "id": 364,
    "name": "西嶼西台古堡",
    "city": "澎湖",
    "district": "西嶼"
  },
  {
    "id": 365,
    "name": "風櫃洞",
    "city": "澎湖",
    "district": "馬公"
  },
  {
    "id": 366,
    "name": "澎湖跨海大橋",
    "city": "澎湖",
    "district": "白沙"
  },
  {
    "id": 367,
    "name": "山水沙灘",
    "city": "澎湖",
    "district": "馬公"
  },
  {
    "id": 368,
    "name": "順承門老街",
    "city": "澎湖",
    "district": "馬公"
  },
  {
    "id": 369,
    "name": "澎湖生態保育館",
    "city": "澎湖",
    "district": "馬公"
  },
  {
    "id": 370,
    "name": "望安花宅聚落",
    "city": "澎湖",
    "district": "望安"
  },
  {
    "id": 371,
    "name": "澎湖海鮮市場",
    "city": "澎湖",
    "district": "馬公"
  },
  {
    "id": 372,
    "name": "虎井沉城浮潛",
    "city": "澎湖",
    "district": "馬公"
  },
  {
    "id": 373,
    "name": "講美玄武岩步道",
    "city": "澎湖",
    "district": "湖西"
  },
  {
    "id": 374,
    "name": "澎湖科技大學天文台",
    "city": "澎湖",
    "district": "馬公"
  },
  {
    "id": 375,
    "name": "古寧頭戰史館",
    "city": "金門",
    "district": "金湖"
  },
  {
    "id": 376,
    "name": "金門國家公園",
    "city": "金門",
    "district": "金城"
  },
  {
    "id": 377,
    "name": "水頭聚落",
    "city": "金門",
    "district": "金城"
  },
  {
    "id": 378,
    "name": "金城老街",
    "city": "金門",
    "district": "金城"
  },
  {
    "id": 379,
    "name": "金門酒廠",
    "city": "金門",
    "district": "金湖"
  },
  {
    "id": 380,
    "name": "翟山坑道",
    "city": "金門",
    "district": "金城"
  },
  {
    "id": 381,
    "name": "馬山觀測所",
    "city": "金門",
    "district": "金湖"
  },
  {
    "id": 382,
    "name": "莒光樓",
    "city": "金門",
    "district": "金城"
  },
  {
    "id": 383,
    "name": "榕園",
    "city": "金門",
    "district": "金城"
  },
  {
    "id": 384,
    "name": "北山古洋樓",
    "city": "金門",
    "district": "金湖"
  },
  {
    "id": 385,
    "name": "慈湖",
    "city": "金門",
    "district": "金城"
  },
  {
    "id": 386,
    "name": "獅山砲陣地",
    "city": "金門",
    "district": "金湖"
  },
  {
    "id": 387,
    "name": "金門高粱田",
    "city": "金門",
    "district": "金沙"
  },
  {
    "id": 388,
    "name": "沙美老街",
    "city": "金門",
    "district": "金沙"
  },
  {
    "id": 389,
    "name": "金門民俗文化村",
    "city": "金門",
    "district": "金湖"
  },
  {
    "id": 390,
    "name": "建功嶼",
    "city": "金門",
    "district": "金城"
  },
  {
    "id": 391,
    "name": "金門貢糖工廠",
    "city": "金門",
    "district": "金城"
  },
  {
    "id": 392,
    "name": "烈嶼老街",
    "city": "金門",
    "district": "烈嶼"
  },
  {
    "id": 393,
    "name": "金門湖泊自行車道",
    "city": "金門",
    "district": "金城"
  },
  {
    "id": 394,
    "name": "金門縣文化局",
    "city": "金門",
    "district": "金城"
  },
  {
    "id": 395,
    "name": "藍眼淚生態",
    "city": "連江縣",
    "district": "南竿"
  },
  {
    "id": 396,
    "name": "芹壁聚落",
    "city": "連江縣",
    "district": "北竿"
  },
  {
    "id": 397,
    "name": "雲台山步道",
    "city": "連江縣",
    "district": "南竿"
  },
  {
    "id": 398,
    "name": "北海坑道",
    "city": "連江縣",
    "district": "南竿"
  },
  {
    "id": 399,
    "name": "北竿芹壁海灘",
    "city": "連江縣",
    "district": "北竿"
  },
  {
    "id": 400,
    "name": "東莒燈塔",
    "city": "連江縣",
    "district": "東莒"
  },
  {
    "id": 401,
    "name": "西莒青帆漁港",
    "city": "連江縣",
    "district": "西莒"
  },
  {
    "id": 402,
    "name": "南竿老街",
    "city": "連江縣",
    "district": "南竿"
  },
  {
    "id": 403,
    "name": "枕戈待旦牌樓",
    "city": "連江縣",
    "district": "南竿"
  },
  {
    "id": 404,
    "name": "大漢據點",
    "city": "連江縣",
    "district": "南竿"
  },
  {
    "id": 405,
    "name": "北竿板里沙灘",
    "city": "連江縣",
    "district": "北竿"
  },
  {
    "id": 406,
    "name": "馬祖酒廠",
    "city": "連江縣",
    "district": "南竿"
  },
  {
    "id": 407,
    "name": "天后宮",
    "city": "連江縣",
    "district": "南竿"
  },
  {
    "id": 408,
    "name": "馬祖民俗文物館",
    "city": "連江縣",
    "district": "南竿"
  },
  {
    "id": 409,
    "name": "鐵堡據點",
    "city": "連江縣",
    "district": "南竿"
  },
  {
    "id": 410,
    "name": "東引島燈塔",
    "city": "連江縣",
    "district": "東引"
  },
  {
    "id": 411,
    "name": "羅漢坪地質景觀",
    "city": "連江縣",
    "district": "東莒"
  },
  {
    "id": 412,
    "name": "北竿機場觀景",
    "city": "連江縣",
    "district": "北竿"
  },
  {
    "id": 413,
    "name": "北竿午沙海灘",
    "city": "連江縣",
    "district": "北竿"
  },
  {
    "id": 414,
    "name": "馬祖戰地體驗",
    "city": "連江縣",
    "district": "南竿"
  },
  {
    "id": 415,
    "name": "新竹市立動物園（擴建區）",
    "city": "新竹市",
    "district": "東區"
  },
  {
    "id": 416,
    "name": "新竹眷村博物館",
    "city": "新竹市",
    "district": "東區"
  },
  {
    "id": 417,
    "name": "護城河親水公園",
    "city": "新竹市",
    "district": "北區"
  },
  {
    "id": 418,
    "name": "新竹市文化局演藝廳",
    "city": "新竹市",
    "district": "東區"
  },
  {
    "id": 419,
    "name": "新竹漁港",
    "city": "新竹市",
    "district": "香山"
  },
  {
    "id": 420,
    "name": "香山溼地賞鳥",
    "city": "新竹市",
    "district": "香山"
  },
  {
    "id": 421,
    "name": "新竹之心廣場",
    "city": "新竹市",
    "district": "北區"
  },
  {
    "id": 422,
    "name": "新竹州廳（新竹市政府）",
    "city": "新竹市",
    "district": "北區"
  },
  {
    "id": 423,
    "name": "新竹市立圖書館總館",
    "city": "新竹市",
    "district": "東區"
  },
  {
    "id": 424,
    "name": "新竹貢丸博物館",
    "city": "新竹市",
    "district": "北區"
  },
  {
    "id": 425,
    "name": "新竹公園棒球場",
    "city": "新竹市",
    "district": "東區"
  },
  {
    "id": 426,
    "name": "關西仙草節",
    "city": "新竹縣",
    "district": "關西"
  },
  {
    "id": 427,
    "name": "竹東運動公園",
    "city": "新竹縣",
    "district": "竹東"
  },
  {
    "id": 428,
    "name": "五峰清泉溫泉",
    "city": "新竹縣",
    "district": "五峰"
  },
  {
    "id": 429,
    "name": "鴛鴦湖自然保留區",
    "city": "新竹縣",
    "district": "尖石"
  },
  {
    "id": 430,
    "name": "新埔義民廟",
    "city": "新竹縣",
    "district": "新埔"
  },
  {
    "id": 431,
    "name": "橫山大山背",
    "city": "新竹縣",
    "district": "橫山"
  },
  {
    "id": 432,
    "name": "芎林飛鳳山",
    "city": "新竹縣",
    "district": "芎林"
  },
  {
    "id": 433,
    "name": "湖口老街",
    "city": "新竹縣",
    "district": "湖口"
  },
  {
    "id": 434,
    "name": "嘉義市立美術館",
    "city": "嘉義市",
    "district": "西區"
  },
  {
    "id": 435,
    "name": "嘉義文化中心",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 436,
    "name": "嘉義市噴水圓環",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 437,
    "name": "嘉義鐵道藝術村",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 438,
    "name": "嘉義市立體育館",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 439,
    "name": "仁義潭水庫",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 440,
    "name": "彌陀路火雞肉飯街",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 441,
    "name": "嘉義市立植物園",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 442,
    "name": "嘉義舊監獄（獄政博物館）",
    "city": "嘉義市",
    "district": "西區"
  },
  {
    "id": 443,
    "name": "嘉義市圖書館",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 444,
    "name": "嘉義公明路商圈",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 445,
    "name": "嘉義老爺行旅文史展",
    "city": "嘉義市",
    "district": "西區"
  },
  {
    "id": 446,
    "name": "嘉義市弦管館",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 447,
    "name": "瑞里綠色隧道",
    "city": "嘉義縣",
    "district": "梅山"
  },
  {
    "id": 448,
    "name": "番路柿餅產業道路",
    "city": "嘉義縣",
    "district": "番路"
  },
  {
    "id": 449,
    "name": "達娜伊谷自然生態公園",
    "city": "嘉義縣",
    "district": "阿里山"
  },
  {
    "id": 450,
    "name": "太興岩天空步道",
    "city": "嘉義縣",
    "district": "竹崎"
  },
  {
    "id": 451,
    "name": "東勢湖金針花",
    "city": "嘉義縣",
    "district": "梅山"
  },
  {
    "id": 452,
    "name": "義竹鄉糖廠冰品",
    "city": "嘉義縣",
    "district": "義竹"
  },
  {
    "id": 453,
    "name": "六腳蒜頭糖廠",
    "city": "嘉義縣",
    "district": "六腳"
  },
  {
    "id": 454,
    "name": "西螺大橋老街",
    "city": "雲林",
    "district": "西螺"
  },
  {
    "id": 455,
    "name": "崙背夢幻海芋田",
    "city": "雲林",
    "district": "崙背"
  },
  {
    "id": 456,
    "name": "台西海牛採蚵",
    "city": "雲林",
    "district": "台西"
  },
  {
    "id": 457,
    "name": "口湖蚵仔寮漁村",
    "city": "雲林",
    "district": "口湖"
  },
  {
    "id": 458,
    "name": "北港糖廠冰品",
    "city": "雲林",
    "district": "北港"
  },
  {
    "id": 459,
    "name": "莿桐彩繪村",
    "city": "雲林",
    "district": "莿桐"
  },
  {
    "id": 460,
    "name": "草嶺風景區",
    "city": "雲林",
    "district": "古坑"
  },
  {
    "id": 461,
    "name": "斗六夜市",
    "city": "雲林",
    "district": "斗六"
  },
  {
    "id": 462,
    "name": "台西觀光漁市",
    "city": "雲林",
    "district": "台西"
  },
  {
    "id": 463,
    "name": "元長花生加工廠",
    "city": "雲林",
    "district": "元長"
  },
  {
    "id": 464,
    "name": "水林蕃薯文化館",
    "city": "雲林",
    "district": "水林"
  },
  {
    "id": 465,
    "name": "雲林縣立文化館",
    "city": "雲林",
    "district": "斗六"
  },
  {
    "id": 466,
    "name": "崙背鄉舞鷺農場",
    "city": "雲林",
    "district": "崙背"
  },
  {
    "id": 467,
    "name": "大埤酸菜文化館",
    "city": "雲林",
    "district": "大埤"
  },
  {
    "id": 468,
    "name": "古坑休閒農業區",
    "city": "雲林",
    "district": "古坑"
  },
  {
    "id": 469,
    "name": "麥寮拱範宮",
    "city": "雲林",
    "district": "麥寮"
  },
  {
    "id": 470,
    "name": "二崙老街文化",
    "city": "雲林",
    "district": "二崙"
  },
  {
    "id": 471,
    "name": "北港藝術館",
    "city": "雲林",
    "district": "北港"
  },
  {
    "id": 472,
    "name": "斗六行啟紀念館",
    "city": "雲林",
    "district": "斗六"
  },
  {
    "id": 473,
    "name": "林內親水公園",
    "city": "雲林",
    "district": "林內"
  },
  {
    "id": 474,
    "name": "溪湖糖廠五分車",
    "city": "彰化",
    "district": "溪湖"
  },
  {
    "id": 475,
    "name": "鹿港龍山寺",
    "city": "彰化",
    "district": "鹿港"
  },
  {
    "id": 476,
    "name": "員林百果山遊樂區",
    "city": "彰化",
    "district": "員林"
  },
  {
    "id": 477,
    "name": "芳苑潮間帶牛車",
    "city": "彰化",
    "district": "芳苑"
  },
  {
    "id": 478,
    "name": "花壇茉莉花園",
    "city": "彰化",
    "district": "花壇"
  },
  {
    "id": 479,
    "name": "埔心鄉台灣民俗村",
    "city": "彰化",
    "district": "花壇"
  },
  {
    "id": 480,
    "name": "二水老街集集線起點",
    "city": "彰化",
    "district": "二水"
  },
  {
    "id": 481,
    "name": "社頭乾燥花農場",
    "city": "彰化",
    "district": "社頭"
  },
  {
    "id": 482,
    "name": "彰化市區日式建築群",
    "city": "彰化",
    "district": "彰化市"
  },
  {
    "id": 483,
    "name": "彰化南瑤宮",
    "city": "彰化",
    "district": "彰化市"
  },
  {
    "id": 484,
    "name": "埔鹽鄉鄉野農場",
    "city": "彰化",
    "district": "埔鹽"
  },
  {
    "id": 485,
    "name": "員林夜市",
    "city": "彰化",
    "district": "員林"
  },
  {
    "id": 486,
    "name": "福寶溼地",
    "city": "彰化",
    "district": "福興"
  },
  {
    "id": 487,
    "name": "彰化縣立體育館",
    "city": "彰化",
    "district": "彰化市"
  },
  {
    "id": 488,
    "name": "溪州公園",
    "city": "彰化",
    "district": "溪州"
  },
  {
    "id": 489,
    "name": "竹塘農村溼地生態",
    "city": "彰化",
    "district": "竹塘"
  },
  {
    "id": 490,
    "name": "鹿港興化府古蹟",
    "city": "彰化",
    "district": "鹿港"
  },
  {
    "id": 491,
    "name": "彰化市立圖書館",
    "city": "彰化",
    "district": "彰化市"
  },
  {
    "id": 492,
    "name": "伸港福安宮元宵燈會",
    "city": "彰化",
    "district": "伸港"
  },
  {
    "id": 493,
    "name": "清境農場青青草原",
    "city": "南投",
    "district": "仁愛"
  },
  {
    "id": 494,
    "name": "集集小鎮鐵路",
    "city": "南投",
    "district": "集集"
  },
  {
    "id": 495,
    "name": "合歡山觀星賞雪",
    "city": "南投",
    "district": "仁愛"
  },
  {
    "id": 496,
    "name": "竹山天梯步道",
    "city": "南投",
    "district": "竹山"
  },
  {
    "id": 497,
    "name": "水里蛇窯陶藝",
    "city": "南投",
    "district": "水里"
  },
  {
    "id": 498,
    "name": "日月潭向山遊客中心",
    "city": "南投",
    "district": "魚池"
  },
  {
    "id": 499,
    "name": "惠蓀林場",
    "city": "南投",
    "district": "仁愛"
  },
  {
    "id": 500,
    "name": "草屯九九峰自然地景",
    "city": "南投",
    "district": "草屯"
  },
  {
    "id": 501,
    "name": "鹿谷鳳凰谷鳥園",
    "city": "南投",
    "district": "鹿谷"
  },
  {
    "id": 502,
    "name": "仁愛鄉霧社紀念公園",
    "city": "南投",
    "district": "仁愛"
  },
  {
    "id": 503,
    "name": "埔里農村市集",
    "city": "南投",
    "district": "埔里"
  },
  {
    "id": 504,
    "name": "竹山鎮竹藝博物館",
    "city": "南投",
    "district": "竹山"
  },
  {
    "id": 505,
    "name": "集集武昌宮老街",
    "city": "南投",
    "district": "集集"
  },
  {
    "id": 506,
    "name": "信義鄉羅娜部落",
    "city": "南投",
    "district": "信義"
  },
  {
    "id": 507,
    "name": "竹山下坪熱帶植物園",
    "city": "南投",
    "district": "竹山"
  },
  {
    "id": 508,
    "name": "麗寶樂園馬拉灣",
    "city": "台中",
    "district": "后里"
  },
  {
    "id": 509,
    "name": "科博館植物園溫室",
    "city": "台中",
    "district": "北區"
  },
  {
    "id": 510,
    "name": "新社花海節",
    "city": "台中",
    "district": "新社"
  },
  {
    "id": 511,
    "name": "清水高美溼地",
    "city": "台中",
    "district": "清水"
  },
  {
    "id": 512,
    "name": "台中公園湖心亭",
    "city": "台中",
    "district": "中區"
  },
  {
    "id": 513,
    "name": "新社古堡莊園",
    "city": "台中",
    "district": "新社"
  },
  {
    "id": 514,
    "name": "台中市立美術館",
    "city": "台中",
    "district": "西區"
  },
  {
    "id": 515,
    "name": "霧峰林家宮保第",
    "city": "台中",
    "district": "霧峰"
  },
  {
    "id": 516,
    "name": "台中烏日高鐵探索館",
    "city": "台中",
    "district": "烏日"
  },
  {
    "id": 517,
    "name": "台中市立圖書館",
    "city": "台中",
    "district": "南區"
  },
  {
    "id": 518,
    "name": "大雪山森林遊樂區",
    "city": "台中",
    "district": "和平"
  },
  {
    "id": 519,
    "name": "石岡水壩921遺址",
    "city": "台中",
    "district": "石岡"
  },
  {
    "id": 520,
    "name": "后里馬場騎馬",
    "city": "台中",
    "district": "后里"
  },
  {
    "id": 521,
    "name": "台中市立棒球場",
    "city": "台中",
    "district": "北區"
  },
  {
    "id": 522,
    "name": "豐原糕餅博物館",
    "city": "台中",
    "district": "豐原"
  },
  {
    "id": 523,
    "name": "後龍好望角風車",
    "city": "苗栗",
    "district": "後龍"
  },
  {
    "id": 524,
    "name": "三義勝興車站",
    "city": "苗栗",
    "district": "三義"
  },
  {
    "id": 525,
    "name": "卓蘭大安溪花卉農場",
    "city": "苗栗",
    "district": "卓蘭"
  },
  {
    "id": 526,
    "name": "明德水庫環湖步道",
    "city": "苗栗",
    "district": "頭屋"
  },
  {
    "id": 527,
    "name": "苗栗夜市",
    "city": "苗栗",
    "district": "苗栗市"
  },
  {
    "id": 528,
    "name": "南庄東河吊橋",
    "city": "苗栗",
    "district": "南庄"
  },
  {
    "id": 529,
    "name": "通霄海水浴場",
    "city": "苗栗",
    "district": "通霄"
  },
  {
    "id": 530,
    "name": "大湖酒莊",
    "city": "苗栗",
    "district": "大湖"
  },
  {
    "id": 531,
    "name": "公館鄉農特產市集",
    "city": "苗栗",
    "district": "公館"
  },
  {
    "id": 532,
    "name": "卓蘭泛舟",
    "city": "苗栗",
    "district": "卓蘭"
  },
  {
    "id": 533,
    "name": "苗栗縣木雕文化園區",
    "city": "苗栗",
    "district": "三義"
  },
  {
    "id": 534,
    "name": "獅潭百年老街",
    "city": "苗栗",
    "district": "獅潭"
  },
  {
    "id": 535,
    "name": "新竹市立動物園",
    "city": "新竹市",
    "district": "東區"
  },
  {
    "id": 536,
    "name": "新竹市青草湖",
    "city": "新竹市",
    "district": "東區"
  },
  {
    "id": 537,
    "name": "新竹孔廟廣場",
    "city": "新竹市",
    "district": "北區"
  },
  {
    "id": 538,
    "name": "新竹漁港海鮮",
    "city": "新竹市",
    "district": "香山"
  },
  {
    "id": 539,
    "name": "新竹十八尖山步道",
    "city": "新竹市",
    "district": "東區"
  },
  {
    "id": 540,
    "name": "新竹火車站廣場",
    "city": "新竹市",
    "district": "北區"
  },
  {
    "id": 541,
    "name": "新竹風城夜市",
    "city": "新竹市",
    "district": "北區"
  },
  {
    "id": 542,
    "name": "新竹州廳歷史建築",
    "city": "新竹市",
    "district": "北區"
  },
  {
    "id": 543,
    "name": "新竹市眷村博物館",
    "city": "新竹市",
    "district": "東區"
  },
  {
    "id": 544,
    "name": "新竹市立圖書館",
    "city": "新竹市",
    "district": "東區"
  },
  {
    "id": 545,
    "name": "新竹市之心廣場",
    "city": "新竹市",
    "district": "北區"
  },
  {
    "id": 546,
    "name": "新竹天主堂",
    "city": "新竹市",
    "district": "北區"
  },
  {
    "id": 547,
    "name": "新竹南寮漁港",
    "city": "新竹市",
    "district": "北區"
  },
  {
    "id": 548,
    "name": "新竹市立游泳池",
    "city": "新竹市",
    "district": "東區"
  },
  {
    "id": 549,
    "name": "新竹市玻璃工坊DIY",
    "city": "新竹市",
    "district": "東區"
  },
  {
    "id": 550,
    "name": "新竹市城隍廟米粉炒",
    "city": "新竹市",
    "district": "北區"
  },
  {
    "id": 551,
    "name": "新竹市立體育中心",
    "city": "新竹市",
    "district": "東區"
  },
  {
    "id": 552,
    "name": "新竹大廟附近散策",
    "city": "新竹市",
    "district": "北區"
  },
  {
    "id": 553,
    "name": "新竹市公園",
    "city": "新竹市",
    "district": "東區"
  },
  {
    "id": 554,
    "name": "新竹市夜間亮化景觀",
    "city": "新竹市",
    "district": "北區"
  },
  {
    "id": 555,
    "name": "新竹竹蓮寺",
    "city": "新竹市",
    "district": "北區"
  },
  {
    "id": 556,
    "name": "內灣老街野薑花粽",
    "city": "新竹縣",
    "district": "橫山"
  },
  {
    "id": 557,
    "name": "北埔老街擂茶",
    "city": "新竹縣",
    "district": "北埔"
  },
  {
    "id": 558,
    "name": "湖口老街巴洛克建築",
    "city": "新竹縣",
    "district": "湖口"
  },
  {
    "id": 559,
    "name": "關西老街仙草冰",
    "city": "新竹縣",
    "district": "關西"
  },
  {
    "id": 560,
    "name": "芎林飛鳳山步道",
    "city": "新竹縣",
    "district": "芎林"
  },
  {
    "id": 561,
    "name": "司馬庫斯神木群",
    "city": "新竹縣",
    "district": "尖石"
  },
  {
    "id": 562,
    "name": "竹北六家老街",
    "city": "新竹縣",
    "district": "竹北"
  },
  {
    "id": 563,
    "name": "竹東林業展示館",
    "city": "新竹縣",
    "district": "竹東"
  },
  {
    "id": 564,
    "name": "北埔冷泉",
    "city": "新竹縣",
    "district": "北埔"
  },
  {
    "id": 565,
    "name": "新竹縣立演藝廳",
    "city": "新竹縣",
    "district": "竹北"
  },
  {
    "id": 566,
    "name": "橫山大山背客家農村",
    "city": "新竹縣",
    "district": "橫山"
  },
  {
    "id": 567,
    "name": "峨眉湖水月禪寺",
    "city": "新竹縣",
    "district": "峨眉"
  },
  {
    "id": 568,
    "name": "竹北高鐵車站廣場",
    "city": "新竹縣",
    "district": "竹北"
  },
  {
    "id": 569,
    "name": "五峰白蘭泰雅部落",
    "city": "新竹縣",
    "district": "五峰"
  },
  {
    "id": 570,
    "name": "新豐紅樹林生態",
    "city": "新竹縣",
    "district": "新豐"
  },
  {
    "id": 571,
    "name": "寶山水庫環湖",
    "city": "新竹縣",
    "district": "寶山"
  },
  {
    "id": 572,
    "name": "尖石那羅溪戲水",
    "city": "新竹縣",
    "district": "尖石"
  },
  {
    "id": 573,
    "name": "芎林水坑螢火蟲步道",
    "city": "新竹縣",
    "district": "芎林"
  },
  {
    "id": 574,
    "name": "竹東夜市客家小吃",
    "city": "新竹縣",
    "district": "竹東"
  },
  {
    "id": 575,
    "name": "新竹縣立圖書館",
    "city": "新竹縣",
    "district": "竹北"
  },
  {
    "id": 576,
    "name": "芎林客家文化館",
    "city": "新竹縣",
    "district": "芎林"
  },
  {
    "id": 577,
    "name": "關西仙草田農業體驗",
    "city": "新竹縣",
    "district": "關西"
  },
  {
    "id": 578,
    "name": "澎湖菊島花火節",
    "city": "澎湖",
    "district": "馬公"
  },
  {
    "id": 579,
    "name": "西嶼漁翁島燈塔",
    "city": "澎湖",
    "district": "西嶼"
  },
  {
    "id": 580,
    "name": "仙人掌公園",
    "city": "澎湖",
    "district": "馬公"
  },
  {
    "id": 581,
    "name": "澎湖仙人掌冰",
    "city": "澎湖",
    "district": "馬公"
  },
  {
    "id": 582,
    "name": "青灣海灘浮潛",
    "city": "澎湖",
    "district": "馬公"
  },
  {
    "id": 583,
    "name": "澎湖文石博物館",
    "city": "澎湖",
    "district": "馬公"
  },
  {
    "id": 584,
    "name": "大菓葉玄武岩",
    "city": "澎湖",
    "district": "西嶼"
  },
  {
    "id": 585,
    "name": "澎湖夜市小吃",
    "city": "澎湖",
    "district": "馬公"
  },
  {
    "id": 586,
    "name": "澎湖石泉老聚落",
    "city": "澎湖",
    "district": "湖西"
  },
  {
    "id": 587,
    "name": "七美人塚",
    "city": "澎湖",
    "district": "七美"
  },
  {
    "id": 588,
    "name": "澎湖北海泛舟",
    "city": "澎湖",
    "district": "白沙"
  },
  {
    "id": 589,
    "name": "澎湖縣立圖書館",
    "city": "澎湖",
    "district": "馬公"
  },
  {
    "id": 590,
    "name": "澎湖東衛石雕公園",
    "city": "澎湖",
    "district": "馬公"
  },
  {
    "id": 591,
    "name": "澎湖SUP立槳",
    "city": "澎湖",
    "district": "馬公"
  },
  {
    "id": 592,
    "name": "澎湖馬公舊城區散步",
    "city": "澎湖",
    "district": "馬公"
  },
  {
    "id": 593,
    "name": "金門鋼刀博物館",
    "city": "金門",
    "district": "金城"
  },
  {
    "id": 594,
    "name": "金門太武山健行",
    "city": "金門",
    "district": "金湖"
  },
  {
    "id": 595,
    "name": "建功嶼退潮走路",
    "city": "金門",
    "district": "金城"
  },
  {
    "id": 596,
    "name": "慈湖賞鳥",
    "city": "金門",
    "district": "金城"
  },
  {
    "id": 597,
    "name": "烈嶼鄉自行車道",
    "city": "金門",
    "district": "烈嶼"
  },
  {
    "id": 598,
    "name": "北山播音站",
    "city": "金門",
    "district": "金湖"
  },
  {
    "id": 599,
    "name": "金門蚵仔海鮮料理",
    "city": "金門",
    "district": "金城"
  },
  {
    "id": 600,
    "name": "金門環島自行車道",
    "city": "金門",
    "district": "金城"
  },
  {
    "id": 601,
    "name": "珠山聚落",
    "city": "金門",
    "district": "金城"
  },
  {
    "id": 602,
    "name": "金門縣立圖書館",
    "city": "金門",
    "district": "金城"
  },
  {
    "id": 603,
    "name": "金門夜市",
    "city": "金門",
    "district": "金城"
  },
  {
    "id": 604,
    "name": "金門花崗岩博物館",
    "city": "金門",
    "district": "金湖"
  },
  {
    "id": 605,
    "name": "金門海邊觀落日",
    "city": "金門",
    "district": "金城"
  },
  {
    "id": 606,
    "name": "烈嶼鄉蘭山步道",
    "city": "金門",
    "district": "烈嶼"
  },
  {
    "id": 607,
    "name": "金門農漁業文化館",
    "city": "金門",
    "district": "金沙"
  },
  {
    "id": 608,
    "name": "藍眼淚生態體驗",
    "city": "連江縣",
    "district": "南竿"
  },
  {
    "id": 609,
    "name": "北竿塘岐老街",
    "city": "連江縣",
    "district": "北竿"
  },
  {
    "id": 610,
    "name": "馬祖酒廠老酒",
    "city": "連江縣",
    "district": "南竿"
  },
  {
    "id": 611,
    "name": "東莒福正聚落",
    "city": "連江縣",
    "district": "莒光"
  },
  {
    "id": 612,
    "name": "北竿橋仔村",
    "city": "連江縣",
    "district": "北竿"
  },
  {
    "id": 613,
    "name": "馬祖繼光餅工坊",
    "city": "連江縣",
    "district": "南竿"
  },
  {
    "id": 614,
    "name": "北竿大沃沙灘",
    "city": "連江縣",
    "district": "北竿"
  },
  {
    "id": 615,
    "name": "馬祖老酒麵線製作",
    "city": "連江縣",
    "district": "南竿"
  },
  {
    "id": 616,
    "name": "馬祖風獅爺巡禮",
    "city": "連江縣",
    "district": "南竿"
  },
  {
    "id": 617,
    "name": "東引阿兵哥咖啡",
    "city": "連江縣",
    "district": "東引"
  },
  {
    "id": 618,
    "name": "西莒島環島步道",
    "city": "連江縣",
    "district": "莒光"
  },
  {
    "id": 619,
    "name": "馬祖縣立文化館",
    "city": "連江縣",
    "district": "南竿"
  },
  {
    "id": 620,
    "name": "北竿白沙海岸",
    "city": "連江縣",
    "district": "北竿"
  },
  {
    "id": 621,
    "name": "馬祖縣立圖書館",
    "city": "連江縣",
    "district": "南竿"
  },
  {
    "id": 622,
    "name": "北竿螺山砲台",
    "city": "連江縣",
    "district": "北竿"
  },
  {
    "id": 623,
    "name": "馬祖藍眼淚預報",
    "city": "連江縣",
    "district": "南竿"
  },
  {
    "id": 624,
    "name": "馬祖戰地體驗活動",
    "city": "連江縣",
    "district": "南竿"
  },
  {
    "id": 625,
    "name": "桃園燈會藝術節",
    "city": "桃園",
    "district": "桃園區"
  },
  {
    "id": 626,
    "name": "大溪木藝生態博物館",
    "city": "桃園",
    "district": "大溪"
  },
  {
    "id": 627,
    "name": "平鎮三坑老街",
    "city": "桃園",
    "district": "平鎮"
  },
  {
    "id": 628,
    "name": "桃園市兒童美術館",
    "city": "桃園",
    "district": "桃園區"
  },
  {
    "id": 629,
    "name": "觀音蓮花季",
    "city": "桃園",
    "district": "觀音"
  },
  {
    "id": 630,
    "name": "新屋范姜古厝",
    "city": "桃園",
    "district": "新屋"
  },
  {
    "id": 631,
    "name": "楊梅秀才窩步道",
    "city": "桃園",
    "district": "楊梅"
  },
  {
    "id": 632,
    "name": "龍潭石門活魚餐廳街",
    "city": "桃園",
    "district": "龍潭"
  },
  {
    "id": 633,
    "name": "八德埤塘生態公園",
    "city": "桃園",
    "district": "八德"
  },
  {
    "id": 634,
    "name": "桃園蘆竹五酒桶山",
    "city": "桃園",
    "district": "蘆竹"
  },
  {
    "id": 635,
    "name": "大溪蓮座山觀音寺",
    "city": "桃園",
    "district": "大溪"
  },
  {
    "id": 636,
    "name": "桃園市立圖書館總館",
    "city": "桃園",
    "district": "桃園區"
  },
  {
    "id": 637,
    "name": "角板山行館",
    "city": "桃園",
    "district": "復興"
  },
  {
    "id": 638,
    "name": "桃園南崁溪親水步道",
    "city": "桃園",
    "district": "蘆竹"
  },
  {
    "id": 639,
    "name": "中壢中正公園",
    "city": "桃園",
    "district": "中壢"
  },
  {
    "id": 640,
    "name": "龜山公西游泳池",
    "city": "桃園",
    "district": "龜山"
  },
  {
    "id": 641,
    "name": "復興羅浮露營區",
    "city": "桃園",
    "district": "復興"
  },
  {
    "id": 642,
    "name": "新屋永安海港",
    "city": "桃園",
    "district": "新屋"
  },
  {
    "id": 643,
    "name": "大園航空城展示館",
    "city": "桃園",
    "district": "大園"
  },
  {
    "id": 644,
    "name": "桃園台地埤塘腳踏車道",
    "city": "桃園",
    "district": "觀音"
  },
  {
    "id": 645,
    "name": "八德廣豐夜市",
    "city": "桃園",
    "district": "八德"
  },
  {
    "id": 646,
    "name": "關西東安古橋",
    "city": "桃園",
    "district": "關西"
  },
  {
    "id": 647,
    "name": "大溪後慈湖生態園區",
    "city": "桃園",
    "district": "大溪"
  },
  {
    "id": 648,
    "name": "復興角板山公園",
    "city": "桃園",
    "district": "復興"
  },
  {
    "id": 649,
    "name": "中壢藝術館",
    "city": "桃園",
    "district": "中壢"
  },
  {
    "id": 650,
    "name": "桃園市立游泳池",
    "city": "桃園",
    "district": "桃園區"
  },
  {
    "id": 651,
    "name": "龍潭觀音山步道",
    "city": "桃園",
    "district": "龍潭"
  },
  {
    "id": 652,
    "name": "台北植物園",
    "city": "台北",
    "district": "中正"
  },
  {
    "id": 653,
    "name": "國立歷史博物館",
    "city": "台北",
    "district": "中正"
  },
  {
    "id": 654,
    "name": "台北市客家文化主題公園",
    "city": "台北",
    "district": "中正"
  },
  {
    "id": 655,
    "name": "行天宮",
    "city": "台北",
    "district": "中山"
  },
  {
    "id": 656,
    "name": "台北孔廟",
    "city": "台北",
    "district": "中山"
  },
  {
    "id": 657,
    "name": "大龍峒保安宮",
    "city": "台北",
    "district": "大同"
  },
  {
    "id": 658,
    "name": "中正紀念堂",
    "city": "台北",
    "district": "中正"
  },
  {
    "id": 659,
    "name": "台北市立美術館",
    "city": "台北",
    "district": "中山"
  },
  {
    "id": 660,
    "name": "烏來內洞森林遊樂區",
    "city": "台北",
    "district": "烏來"
  },
  {
    "id": 661,
    "name": "陽明山蝴蝶花廊",
    "city": "台北",
    "district": "士林"
  },
  {
    "id": 662,
    "name": "松山文創園區",
    "city": "台北",
    "district": "信義"
  },
  {
    "id": 663,
    "name": "台北西門町",
    "city": "台北",
    "district": "萬華"
  },
  {
    "id": 664,
    "name": "景美仙跡岩步道",
    "city": "台北",
    "district": "文山"
  },
  {
    "id": 665,
    "name": "台北燈節",
    "city": "台北",
    "district": "中正"
  },
  {
    "id": 666,
    "name": "南港展覽館",
    "city": "台北",
    "district": "南港"
  },
  {
    "id": 667,
    "name": "圓山大飯店河濱公園",
    "city": "台北",
    "district": "中山"
  },
  {
    "id": 668,
    "name": "台北濱江市場",
    "city": "台北",
    "district": "中山"
  },
  {
    "id": 669,
    "name": "台北市立天文館IMAX",
    "city": "台北",
    "district": "中山"
  },
  {
    "id": 670,
    "name": "台北兒童育樂中心",
    "city": "台北",
    "district": "中山"
  },
  {
    "id": 671,
    "name": "迪化街南北貨",
    "city": "台北",
    "district": "大同"
  },
  {
    "id": 672,
    "name": "台北市信義商圈",
    "city": "台北",
    "district": "信義"
  },
  {
    "id": 673,
    "name": "木柵指南宮",
    "city": "台北",
    "district": "文山"
  },
  {
    "id": 674,
    "name": "台北市立棒球場",
    "city": "台北",
    "district": "信義"
  },
  {
    "id": 675,
    "name": "新北市歡樂耶誕城",
    "city": "新北",
    "district": "板橋"
  },
  {
    "id": 676,
    "name": "新北市立美術館",
    "city": "新北",
    "district": "板橋"
  },
  {
    "id": 677,
    "name": "板橋林家花園",
    "city": "新北",
    "district": "板橋"
  },
  {
    "id": 678,
    "name": "安坑輕軌沿線步道",
    "city": "新北",
    "district": "新店"
  },
  {
    "id": 679,
    "name": "石門洞",
    "city": "新北",
    "district": "石門"
  },
  {
    "id": 680,
    "name": "淡水漁人碼頭",
    "city": "新北",
    "district": "淡水"
  },
  {
    "id": 681,
    "name": "猴硐貓村",
    "city": "新北",
    "district": "瑞芳"
  },
  {
    "id": 682,
    "name": "新莊廟街夜市",
    "city": "新北",
    "district": "新莊"
  },
  {
    "id": 683,
    "name": "板橋435藝文特區",
    "city": "新北",
    "district": "板橋"
  },
  {
    "id": 684,
    "name": "永和樂華夜市",
    "city": "新北",
    "district": "永和"
  },
  {
    "id": 685,
    "name": "土城桐花公園",
    "city": "新北",
    "district": "土城"
  },
  {
    "id": 686,
    "name": "萬里野柳漁港",
    "city": "新北",
    "district": "萬里"
  },
  {
    "id": 687,
    "name": "林口奧萊購物中心",
    "city": "新北",
    "district": "林口"
  },
  {
    "id": 688,
    "name": "三峽甘樂文創",
    "city": "新北",
    "district": "三峽"
  },
  {
    "id": 689,
    "name": "新北市立十三行博物館",
    "city": "新北",
    "district": "八里"
  },
  {
    "id": 690,
    "name": "八里左岸公園",
    "city": "新北",
    "district": "八里"
  },
  {
    "id": 691,
    "name": "深澳鐵道自行車",
    "city": "新北",
    "district": "瑞芳"
  },
  {
    "id": 692,
    "name": "龍洞灣岬步道",
    "city": "新北",
    "district": "貢寮"
  },
  {
    "id": 693,
    "name": "淡水天元宮吉野櫻",
    "city": "新北",
    "district": "淡水"
  },
  {
    "id": 694,
    "name": "石碇豆腐老街",
    "city": "新北",
    "district": "石碇"
  },
  {
    "id": 695,
    "name": "汐止新山夢湖",
    "city": "新北",
    "district": "汐止"
  },
  {
    "id": 696,
    "name": "貢寮福隆沙雕",
    "city": "新北",
    "district": "貢寮"
  },
  {
    "id": 697,
    "name": "三重先嗇宮夜市",
    "city": "新北",
    "district": "三重"
  },
  {
    "id": 698,
    "name": "中和錦和運動公園",
    "city": "新北",
    "district": "中和"
  },
  {
    "id": 699,
    "name": "基隆田寮河燈節",
    "city": "基隆",
    "district": "仁愛"
  },
  {
    "id": 700,
    "name": "基隆暖暖親水公園",
    "city": "基隆",
    "district": "暖暖"
  },
  {
    "id": 701,
    "name": "基隆砲台步道群",
    "city": "基隆",
    "district": "中正"
  },
  {
    "id": 702,
    "name": "七堵鐵路展示館",
    "city": "基隆",
    "district": "七堵"
  },
  {
    "id": 703,
    "name": "基隆港西岸旅客中心",
    "city": "基隆",
    "district": "中正"
  },
  {
    "id": 704,
    "name": "暖暖老街",
    "city": "基隆",
    "district": "暖暖"
  },
  {
    "id": 705,
    "name": "基隆明德水庫步道",
    "city": "基隆",
    "district": "安樂"
  },
  {
    "id": 706,
    "name": "基隆中正公園夜景",
    "city": "基隆",
    "district": "中正"
  },
  {
    "id": 707,
    "name": "基隆仙洞巖",
    "city": "基隆",
    "district": "中正"
  },
  {
    "id": 708,
    "name": "潮境公園恐龍裝置",
    "city": "基隆",
    "district": "中正"
  },
  {
    "id": 709,
    "name": "瑪陵坑溪親水步道",
    "city": "基隆",
    "district": "七堵"
  },
  {
    "id": 710,
    "name": "基隆碧砂漁港",
    "city": "基隆",
    "district": "中正"
  },
  {
    "id": 711,
    "name": "基隆崁仔頂漁市",
    "city": "基隆",
    "district": "仁愛"
  },
  {
    "id": 712,
    "name": "基隆天顯堂",
    "city": "基隆",
    "district": "安樂"
  },
  {
    "id": 713,
    "name": "基隆市兒童公園",
    "city": "基隆",
    "district": "仁愛"
  },
  {
    "id": 714,
    "name": "暖暖水源地步道",
    "city": "基隆",
    "district": "暖暖"
  },
  {
    "id": 715,
    "name": "基隆深澳漁港",
    "city": "基隆",
    "district": "信義"
  },
  {
    "id": 716,
    "name": "基隆火號山步道",
    "city": "基隆",
    "district": "七堵"
  },
  {
    "id": 717,
    "name": "七堵老街",
    "city": "基隆",
    "district": "七堵"
  },
  {
    "id": 718,
    "name": "基隆長潭里螃蟹廟",
    "city": "基隆",
    "district": "信義"
  },
  {
    "id": 719,
    "name": "基隆牛稠溪公園",
    "city": "基隆",
    "district": "暖暖"
  },
  {
    "id": 720,
    "name": "基隆孝三路小吃街",
    "city": "基隆",
    "district": "信義"
  },
  {
    "id": 721,
    "name": "基隆正濱漁港彩繪",
    "city": "基隆",
    "district": "中正"
  },
  {
    "id": 722,
    "name": "基隆海洋廣場",
    "city": "基隆",
    "district": "中正"
  },
  {
    "id": 723,
    "name": "基隆市立天文台",
    "city": "基隆",
    "district": "中正"
  },
  {
    "id": 724,
    "name": "蘭陽博物館",
    "city": "宜蘭",
    "district": "頭城"
  },
  {
    "id": 725,
    "name": "羅東林業文化園區",
    "city": "宜蘭",
    "district": "羅東"
  },
  {
    "id": 726,
    "name": "蘇澳白米木屐村",
    "city": "宜蘭",
    "district": "蘇澳"
  },
  {
    "id": 727,
    "name": "三星行健有機村",
    "city": "宜蘭",
    "district": "三星"
  },
  {
    "id": 728,
    "name": "宜蘭酒廠",
    "city": "宜蘭",
    "district": "宜蘭市"
  },
  {
    "id": 729,
    "name": "壯圍沙丘旅遊服務園區",
    "city": "宜蘭",
    "district": "壯圍"
  },
  {
    "id": 730,
    "name": "宜蘭原生植物園",
    "city": "宜蘭",
    "district": "員山"
  },
  {
    "id": 731,
    "name": "五峰旗瀑布步道",
    "city": "宜蘭",
    "district": "礁溪"
  },
  {
    "id": 732,
    "name": "大同鄉福山植物園",
    "city": "宜蘭",
    "district": "大同"
  },
  {
    "id": 733,
    "name": "南澳古道",
    "city": "宜蘭",
    "district": "南澳"
  },
  {
    "id": 734,
    "name": "梅花湖環湖腳踏車",
    "city": "宜蘭",
    "district": "冬山"
  },
  {
    "id": 735,
    "name": "員山望龍埤",
    "city": "宜蘭",
    "district": "員山"
  },
  {
    "id": 736,
    "name": "宜蘭河濱自行車道",
    "city": "宜蘭",
    "district": "宜蘭市"
  },
  {
    "id": 737,
    "name": "太平山國家森林",
    "city": "宜蘭",
    "district": "大同"
  },
  {
    "id": 738,
    "name": "宜蘭傳統市場",
    "city": "宜蘭",
    "district": "宜蘭市"
  },
  {
    "id": 739,
    "name": "頭城濱海森林公園",
    "city": "宜蘭",
    "district": "頭城"
  },
  {
    "id": 740,
    "name": "石城仔濱海步道",
    "city": "宜蘭",
    "district": "頭城"
  },
  {
    "id": 741,
    "name": "礁溪溫泉公園泡腳池",
    "city": "宜蘭",
    "district": "礁溪"
  },
  {
    "id": 742,
    "name": "宜蘭綠色博覽會",
    "city": "宜蘭",
    "district": "冬山"
  },
  {
    "id": 743,
    "name": "三星大洲溪螢火蟲",
    "city": "宜蘭",
    "district": "三星"
  },
  {
    "id": 744,
    "name": "東澳粉鳥林秘境",
    "city": "宜蘭",
    "district": "蘇澳"
  },
  {
    "id": 745,
    "name": "太魯閣砂卡礑步道",
    "city": "花蓮",
    "district": "秀林"
  },
  {
    "id": 746,
    "name": "太魯閣白楊步道",
    "city": "花蓮",
    "district": "秀林"
  },
  {
    "id": 747,
    "name": "花蓮洄瀾灣海岸",
    "city": "花蓮",
    "district": "花蓮市"
  },
  {
    "id": 748,
    "name": "富源溪蝴蝶谷",
    "city": "花蓮",
    "district": "瑞穗"
  },
  {
    "id": 749,
    "name": "鳳林菸樓故事館",
    "city": "花蓮",
    "district": "鳳林"
  },
  {
    "id": 750,
    "name": "花蓮石梯坪",
    "city": "花蓮",
    "district": "豐濱"
  },
  {
    "id": 751,
    "name": "新社梯田",
    "city": "花蓮",
    "district": "豐濱"
  },
  {
    "id": 752,
    "name": "花蓮觀光夜市",
    "city": "花蓮",
    "district": "花蓮市"
  },
  {
    "id": 753,
    "name": "大農大富平地森林",
    "city": "花蓮",
    "district": "光復"
  },
  {
    "id": 754,
    "name": "崇德海灘",
    "city": "花蓮",
    "district": "秀林"
  },
  {
    "id": 755,
    "name": "花蓮縣原住民族文化館",
    "city": "花蓮",
    "district": "花蓮市"
  },
  {
    "id": 756,
    "name": "玉里橋仔頭文創聚落",
    "city": "花蓮",
    "district": "玉里"
  },
  {
    "id": 757,
    "name": "壽豐雲山水夢幻湖",
    "city": "花蓮",
    "district": "壽豐"
  },
  {
    "id": 758,
    "name": "花蓮鯉魚山步道",
    "city": "花蓮",
    "district": "壽豐"
  },
  {
    "id": 759,
    "name": "馬太鞍溼地生態園區",
    "city": "花蓮",
    "district": "光復"
  },
  {
    "id": 760,
    "name": "豐濱長虹橋",
    "city": "花蓮",
    "district": "豐濱"
  },
  {
    "id": 761,
    "name": "光復糖廠冰淇淋",
    "city": "花蓮",
    "district": "光復"
  },
  {
    "id": 762,
    "name": "奇美部落獨木舟",
    "city": "花蓮",
    "district": "瑞穗"
  },
  {
    "id": 763,
    "name": "銅門梅園步道",
    "city": "花蓮",
    "district": "秀林"
  },
  {
    "id": 764,
    "name": "花蓮南濱海岸公園",
    "city": "花蓮",
    "district": "花蓮市"
  },
  {
    "id": 765,
    "name": "台東活水湖",
    "city": "台東",
    "district": "台東市"
  },
  {
    "id": 766,
    "name": "三仙台八拱橋",
    "city": "台東",
    "district": "成功"
  },
  {
    "id": 767,
    "name": "台東海濱公園",
    "city": "台東",
    "district": "台東市"
  },
  {
    "id": 768,
    "name": "金樽漁港",
    "city": "台東",
    "district": "東河"
  },
  {
    "id": 769,
    "name": "池上天堂路",
    "city": "台東",
    "district": "池上"
  },
  {
    "id": 770,
    "name": "台東縣原住民族文化館",
    "city": "台東",
    "district": "台東市"
  },
  {
    "id": 771,
    "name": "都蘭山步道",
    "city": "台東",
    "district": "東河"
  },
  {
    "id": 772,
    "name": "池上農夫市集",
    "city": "台東",
    "district": "池上"
  },
  {
    "id": 773,
    "name": "台東縣立圖書館",
    "city": "台東",
    "district": "台東市"
  },
  {
    "id": 774,
    "name": "泰源幽谷",
    "city": "台東",
    "district": "東河"
  },
  {
    "id": 775,
    "name": "長光梯田",
    "city": "台東",
    "district": "長濱"
  },
  {
    "id": 776,
    "name": "鸞山部落森林博物館",
    "city": "台東",
    "district": "延平"
  },
  {
    "id": 777,
    "name": "台東市區原住民廣場",
    "city": "台東",
    "district": "台東市"
  },
  {
    "id": 778,
    "name": "東河包子",
    "city": "台東",
    "district": "東河"
  },
  {
    "id": 779,
    "name": "台東糖廠冰品",
    "city": "台東",
    "district": "台東市"
  },
  {
    "id": 780,
    "name": "大鵬灣自行車道",
    "city": "屏東",
    "district": "東港"
  },
  {
    "id": 781,
    "name": "萬金天主堂",
    "city": "屏東",
    "district": "萬巒"
  },
  {
    "id": 782,
    "name": "高士佛部落",
    "city": "屏東",
    "district": "牡丹"
  },
  {
    "id": 783,
    "name": "霧台神山瀑布",
    "city": "屏東",
    "district": "霧台"
  },
  {
    "id": 784,
    "name": "三地門排灣族彩繪",
    "city": "屏東",
    "district": "三地門"
  },
  {
    "id": 785,
    "name": "內埔六堆客家文化園區",
    "city": "屏東",
    "district": "內埔"
  },
  {
    "id": 786,
    "name": "竹田驛園",
    "city": "屏東",
    "district": "竹田"
  },
  {
    "id": 787,
    "name": "屏東縣立美術館",
    "city": "屏東",
    "district": "屏東市"
  },
  {
    "id": 788,
    "name": "恆春城門散策",
    "city": "屏東",
    "district": "恆春"
  },
  {
    "id": 789,
    "name": "墾丁南灣浮潛",
    "city": "屏東",
    "district": "恆春"
  },
  {
    "id": 790,
    "name": "墾丁白砂灣",
    "city": "屏東",
    "district": "恆春"
  },
  {
    "id": 791,
    "name": "屏東縣立圖書館",
    "city": "屏東",
    "district": "屏東市"
  },
  {
    "id": 792,
    "name": "南仁湖生態保護區",
    "city": "屏東",
    "district": "恆春"
  },
  {
    "id": 793,
    "name": "恆春鎮東門城",
    "city": "屏東",
    "district": "恆春"
  },
  {
    "id": 794,
    "name": "大鵬灣帆船體驗",
    "city": "屏東",
    "district": "東港"
  },
  {
    "id": 795,
    "name": "林邊牡蠣養殖體驗",
    "city": "屏東",
    "district": "林邊"
  },
  {
    "id": 796,
    "name": "屏東農業生物科技園區",
    "city": "屏東",
    "district": "長治"
  },
  {
    "id": 797,
    "name": "春日古華部落",
    "city": "屏東",
    "district": "春日"
  },
  {
    "id": 798,
    "name": "瑪家原住民文化園區",
    "city": "屏東",
    "district": "瑪家"
  },
  {
    "id": 799,
    "name": "佳樂水風景區",
    "city": "屏東",
    "district": "牡丹"
  },
  {
    "id": 800,
    "name": "高雄市立歷史博物館",
    "city": "高雄",
    "district": "鹽埕"
  },
  {
    "id": 801,
    "name": "高雄哈瑪星台灣鐵道館",
    "city": "高雄",
    "district": "鹽埕"
  },
  {
    "id": 802,
    "name": "高雄市立圖書館總館",
    "city": "高雄",
    "district": "苓雅"
  },
  {
    "id": 803,
    "name": "高雄棧貳庫",
    "city": "高雄",
    "district": "鹽埕"
  },
  {
    "id": 804,
    "name": "大東文化藝術中心",
    "city": "高雄",
    "district": "鳳山"
  },
  {
    "id": 805,
    "name": "高雄洲仔溼地公園",
    "city": "高雄",
    "district": "左營"
  },
  {
    "id": 806,
    "name": "旗山老街香蕉冰",
    "city": "高雄",
    "district": "旗山"
  },
  {
    "id": 807,
    "name": "高雄布魯樂谷主題樂園",
    "city": "高雄",
    "district": "大寮"
  },
  {
    "id": 808,
    "name": "田寮月世界",
    "city": "高雄",
    "district": "田寮"
  },
  {
    "id": 809,
    "name": "燕巢泥岩惡地",
    "city": "高雄",
    "district": "燕巢"
  },
  {
    "id": 810,
    "name": "高雄六合夜市",
    "city": "高雄",
    "district": "新興"
  },
  {
    "id": 811,
    "name": "高雄SKM Park",
    "city": "高雄",
    "district": "三民"
  },
  {
    "id": 812,
    "name": "愛河遊船",
    "city": "高雄",
    "district": "苓雅"
  },
  {
    "id": 813,
    "name": "蓮池潭龍虎塔",
    "city": "高雄",
    "district": "左營"
  },
  {
    "id": 814,
    "name": "鳳山溪河濱公園",
    "city": "高雄",
    "district": "鳳山"
  },
  {
    "id": 815,
    "name": "台南安平樹屋",
    "city": "台南",
    "district": "安平"
  },
  {
    "id": 816,
    "name": "烏山頭水庫",
    "city": "台南",
    "district": "官田"
  },
  {
    "id": 817,
    "name": "台南市立圖書館新總館",
    "city": "台南",
    "district": "北區"
  },
  {
    "id": 818,
    "name": "善化糖廠冰品",
    "city": "台南",
    "district": "善化"
  },
  {
    "id": 819,
    "name": "台南市美術館一館",
    "city": "台南",
    "district": "中西"
  },
  {
    "id": 820,
    "name": "台南市美術館二館",
    "city": "台南",
    "district": "中西"
  },
  {
    "id": 821,
    "name": "台南新化老街",
    "city": "台南",
    "district": "新化"
  },
  {
    "id": 822,
    "name": "北門遊客中心鹽田",
    "city": "台南",
    "district": "北門"
  },
  {
    "id": 823,
    "name": "台南都會公園",
    "city": "台南",
    "district": "安南"
  },
  {
    "id": 824,
    "name": "台南鹽水蜂炮",
    "city": "台南",
    "district": "鹽水"
  },
  {
    "id": 825,
    "name": "玉井芒果冰",
    "city": "台南",
    "district": "玉井"
  },
  {
    "id": 826,
    "name": "南科考古學習館",
    "city": "台南",
    "district": "新市"
  },
  {
    "id": 827,
    "name": "台南府城散步路線",
    "city": "台南",
    "district": "中西"
  },
  {
    "id": 828,
    "name": "台南六甲玻璃廟",
    "city": "台南",
    "district": "六甲"
  },
  {
    "id": 829,
    "name": "峨眉東方美人茶",
    "city": "新竹縣",
    "district": "峨眉"
  },
  {
    "id": 830,
    "name": "嘉義東市場",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 831,
    "name": "嘉義交趾陶館",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 832,
    "name": "嘉義射日塔",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 833,
    "name": "蘭潭水庫夜景",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 834,
    "name": "嘉義市立圖書館",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 835,
    "name": "嘉義仁義潭生態步道",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 836,
    "name": "嘉義市立音樂廳",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 837,
    "name": "嘉義舊監獄獄政博物館",
    "city": "嘉義市",
    "district": "西區"
  },
  {
    "id": 838,
    "name": "嘉義豆花街",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 839,
    "name": "嘉義北門車庫園區",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 840,
    "name": "嘉義文化局演藝廳",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 841,
    "name": "嘉義市東公園",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 842,
    "name": "嘉義後站文化街區",
    "city": "嘉義市",
    "district": "西區"
  },
  {
    "id": 843,
    "name": "嘉義彌陀路火雞肉飯街",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 844,
    "name": "嘉義國際管樂節",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 845,
    "name": "嘉義市立游泳池",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 846,
    "name": "嘉義孔廟廣場",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 847,
    "name": "嘉義傳統市場美食",
    "city": "嘉義市",
    "district": "西區"
  },
  {
    "id": 848,
    "name": "嘉義棒球文化館",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 849,
    "name": "嘉義市文化局美術館",
    "city": "嘉義市",
    "district": "西區"
  },
  {
    "id": 850,
    "name": "嘉義客運站舊城漫步",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 851,
    "name": "嘉義市蘭潭音樂噴泉",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 852,
    "name": "嘉義市文化路假日市集",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 853,
    "name": "嘉義市立天文觀測站",
    "city": "嘉義市",
    "district": "東區"
  },
  {
    "id": 854,
    "name": "達邦鄒族文化",
    "city": "嘉義縣",
    "district": "阿里山"
  },
  {
    "id": 855,
    "name": "觸口天長地久吊橋",
    "city": "嘉義縣",
    "district": "番路"
  },
  {
    "id": 856,
    "name": "東石漁港蚵仔",
    "city": "嘉義縣",
    "district": "東石"
  },
  {
    "id": 857,
    "name": "瑞里綠色竹林步道",
    "city": "嘉義縣",
    "district": "梅山"
  },
  {
    "id": 858,
    "name": "新港板陶窯文化館",
    "city": "嘉義縣",
    "district": "新港"
  },
  {
    "id": 859,
    "name": "水上水道頭文化園區",
    "city": "嘉義縣",
    "district": "水上"
  },
  {
    "id": 860,
    "name": "義竹鄉風車地景",
    "city": "嘉義縣",
    "district": "義竹"
  },
  {
    "id": 861,
    "name": "大林糖廠",
    "city": "嘉義縣",
    "district": "大林"
  },
  {
    "id": 862,
    "name": "六腳蒜頭糖廠五分車",
    "city": "嘉義縣",
    "district": "六腳"
  },
  {
    "id": 863,
    "name": "阿里山高山茶園採茶",
    "city": "嘉義縣",
    "district": "阿里山"
  },
  {
    "id": 864,
    "name": "嘉義公園射日塔周邊",
    "city": "嘉義縣",
    "district": "嘉義市"
  },
  {
    "id": 865,
    "name": "布袋好美里海岸賞鳥",
    "city": "嘉義縣",
    "district": "布袋"
  },
  {
    "id": 866,
    "name": "民雄農業試驗所",
    "city": "嘉義縣",
    "district": "民雄"
  },
  {
    "id": 867,
    "name": "嘉義縣文化館",
    "city": "嘉義縣",
    "district": "太保"
  },
  {
    "id": 868,
    "name": "中埔瑞里竹林",
    "city": "嘉義縣",
    "district": "中埔"
  },
  {
    "id": 869,
    "name": "曾文水庫",
    "city": "嘉義縣",
    "district": "大埔"
  }
]

results = {}
failed = []

for i, spot in enumerate(spots):
    query = f"{spot['name']} {spot['city']}{spot['district']} 台灣"
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={urllib.parse.quote(query)}&language=zh-TW&region=TW&key={API_KEY}"
    try:
        with urllib.request.urlopen(url, timeout=8) as r:
            data = json.loads(r.read())
        if data["status"] == "OK":
            loc = data["results"][0]["geometry"]["location"]
            results[spot["id"]] = {"lat": round(loc["lat"], 6), "lng": round(loc["lng"], 6)}
            print(f"[{i+1}/{len(spots)}] ✅ {spot['name']}: {loc['lat']:.4f}, {loc['lng']:.4f}")
        else:
            failed.append(spot["name"])
            print(f"[{i+1}/{len(spots)}] ❌ {spot['name']}: {data['status']}")
    except Exception as e:
        failed.append(spot["name"])
        print(f"[{i+1}/{len(spots)}] ❌ {spot['name']}: {e}")
    time.sleep(0.1)

with open("coords.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"\n✅ 完成！成功 {len(results)} 個，失敗 {len(failed)} 個")
print("已存到 coords.json，請把這個檔案傳給 Claude")
if failed:
    print("失敗清單:", failed[:10])
