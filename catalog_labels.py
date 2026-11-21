"""Descriptive English labels. Original Chinese names/codes remain authoritative.

This local terminology glossary translates recognizable catalog terms; proprietary
series text may be omitted and is marked descriptive rather than supplier-approved.
"""
import re

TERMS = {
    '800库储物柜': '800-series storage cabinet', '储物高柜': 'Tall storage cabinet',
    '成品床头柜': 'Freestanding bedside cabinet', '定制床头柜': 'Custom bedside cabinet',
    '斗柜': 'Chest of drawers', '一个床头柜': 'Bedside cabinet',
    '挂墙装饰画': 'Wall art', '墙挂装饰画': 'Wall art', '装饰画': 'Decorative artwork',
    '床头柜': 'Bedside cabinet', '床头': 'Bedside', '储物柜': 'Storage cabinet',
    '储藏柜': 'Storage cabinet', '上下错位床': 'Offset bunk bed', '上下床': 'Bunk bed',
    '三床': 'Triple bed', '无床屏': 'Without headboard', '婴儿床': 'Baby cot',
    '软床': 'Upholstered bed', '成品床': 'Freestanding bed', '定制床': 'Custom bed',
    '单床': 'Bed', '床柜组合': 'Bed and cabinet set', '多功能床': 'Multifunction bed',
    '侧翻床': 'Side-folding wall bed', '正翻床': 'Vertical-folding wall bed',
    '真皮': 'Genuine leather', '奶咖色': 'Milky coffee colour', '极简': 'Minimalist', '意式': 'Italian style',
    '梳妆台': 'Dressing table', '梳妆凳': 'Dressing stool', '妆台': 'Vanity table',
    '衣柜': 'Wardrobe', '榻榻米': 'Tatami platform', '电视柜': 'TV cabinet',
    '餐边柜': 'Dining sideboard', '鞋柜翻门': 'Shoe cabinet flap', '鞋柜': 'Shoe cabinet',
    '门厅柜': 'Entryway cabinet', '阳台柜': 'Balcony cabinet', '家政柜': 'Utility cabinet',
    '扫地机柜': 'Robot vacuum cabinet', '书柜': 'Bookcase', '书桌': 'Desk',
    '桌台': 'Desk', '边几': 'Side table', '茶几': 'Coffee table', '圆几': 'Round table',
    '餐桌': 'Dining table', '圆桌': 'Round table', '长桌': 'Long table', '餐椅': 'Dining chair',
    '办公椅': 'Office chair', '电脑椅': 'Desk chair', '书椅': 'Desk chair',
    '吧台凳': 'Bar stool', '吧台': 'Bar counter', '岛台': 'Kitchen island',
    '沙发床': 'Sofa bed', '沙发': 'Sofa', '贵妃': 'Chaise', '单人位': 'Single-seat',
    '双人位': 'Two-seat', '三人位': 'Three-seat', '按摩椅': 'Massage chair',
    '休闲椅': 'Lounge chair', '单椅': 'Armchair', '吊篮椅': 'Hanging chair',
    '藤椅': 'Rattan chair', '三角凳': 'Triangular stool', '圆凳': 'Round stool',
    '长凳': 'Bench', '折叠凳': 'Folding stool', '方踏': 'Square ottoman', '长踏': 'Long ottoman',
    '卡座': 'Banquette', '橱柜': 'Kitchen cabinet', '厨柜': 'Kitchen cabinet',
    '炉灶柜': 'Hob cabinet', '星盆柜': 'Sink cabinet', '星盘柜': 'Sink cabinet',
    '水盆柜': 'Sink cabinet', '电器高柜': 'Tall appliance cabinet', '拉篮高柜': 'Tall pull-out cabinet',
    '地柜': 'Base cabinet', '吊柜': 'Wall cabinet', '高柜': 'Tall cabinet', '矮柜': 'Low cabinet',
    '超高柜': 'Extra-tall cabinet', '隔断柜': 'Partition cabinet', '佛龛柜': 'Shrine cabinet',
    '浴室柜': 'Bathroom vanity', '浴缸': 'Bathtub', '马桶': 'Toilet', '蹲便器': 'Squat toilet',
    '花洒': 'Shower', '淋浴房': 'Shower enclosure', '淋浴区': 'Shower area',
    '如厕区': 'Toilet area', '洗漱区': 'Washbasin area', '玻璃隔断': 'Glass partition',
    '窗帘': 'Curtain', '落地灯': 'Floor lamp', '灯具': 'Lighting', '地毯': 'Rug',
    '钢琴': 'Piano', '屏风': 'Room divider', '盆栽': 'Potted plant', '植物': 'Plant',
    '雕塑摆件': 'Decorative sculpture', '摆件': 'Decorative object', '玩偶': 'Figurine',
    '冰箱': 'Refrigerator', '冰柜': 'Freezer', '冰吧': 'Beverage cooler', '冷柜': 'Cold storage cabinet',
    '酒柜': 'Wine cabinet', '洗衣机柜': 'Washing machine cabinet', '洗烘叠加': 'Stacked washer and dryer',
    '洗衣机': 'Washing machine', '干衣机': 'Tumble dryer', '洗烘一体机': 'Washer dryer',
    '空调': 'Air conditioner', '挂机': 'Wall-mounted air conditioner', '柜机': 'Floor-standing air conditioner',
    '饮水机': 'Water dispenser', '电视机': 'Television', '电视': 'Television', '彩电': 'Colour television',
    '蒸烤一体机': 'Steam combination oven', '蒸烤箱': 'Steam oven', '蒸箱': 'Steam oven',
    '烤箱': 'Oven', '热水器': 'Water heater', '吸油烟机': 'Extractor hood', '油烟机': 'Extractor hood',
    '烟机': 'Extractor hood', '燃气灶': 'Gas hob', '洗碗机': 'Dishwasher', '消毒柜': 'Sterilizer cabinet',
    '海尔': 'Haier', '卡萨帝': 'Casarte', '海信': 'Hisense', '哈士奇': 'Husky',
    '鞋柜踢脚抽': 'Shoe cabinet plinth drawer', '挂衣通': 'Clothes rail', '挂衣杆': 'Clothes rail',
    '挂衣架': 'Clothes hanger', '西裤架': 'Trouser rack', '西裤抽': 'Trouser drawer',
    '脏衣篮': 'Laundry basket', '网篮': 'Wire basket', '皮革篮': 'Leather basket',
    '酒瓶酒杯架': 'Bottle and glass rack', '酒瓶架': 'Bottle rack', '酒杯架': 'Glass rack',
    '酒架': 'Wine rack', '格子架': 'Compartment rack', '饰物架': 'Accessory rack',
    '收纳盒': 'Storage organizer', '收纳架': 'Storage rack', '置物架': 'Storage shelf',
    '密码箱': 'Combination safe', '摇表器': 'Watch winder', '扶手': 'Grab rail',
    '层板灯': 'Shelf light', '侧板灯': 'Side-panel light', '射灯': 'Spotlight',
    '灯条': 'Light strip', '灯带': 'Light strip', '电源': 'Power supply',
    '驱动电源': 'LED driver', '触摸开关': 'Touch switch', '门控开关': 'Door switch',
    '人体感应开关': 'Motion sensor switch', '感应开关': 'Sensor switch', '开关': 'Switch',
    '层板': 'Shelf panel', '立隔板': 'Vertical divider panel', '背板': 'Back panel',
    '门板': 'Door panel', '假门': 'False door', '玻璃门': 'Glass door',
    '封板': 'Filler panel', '修口板': 'Scribe panel', '顶封板': 'Top filler panel',
    '望板': 'Fascia panel', '楣板': 'Cornice panel', '眉板': 'Cornice panel',
    '抽屉': 'Drawer', '抽芯': 'Drawer box', '钢抽': 'Steel drawer', '抽拉': 'Pull-out',
    '导轨': 'Runner', '隐藏轨': 'Concealed runner', '缓冲轨': 'Soft-close runner',
    '缓冲': 'Soft-close', '阻尼': 'Soft-close', '三节轨': 'Three-section runner',
    '指纹锁': 'Fingerprint lock', '指纹': 'Fingerprint', '暗格': 'Hidden compartment',
    '挂钩': 'Hook', '衣钩': 'Clothes hook', '挂架': 'Hanging rack',
    '更衣镜': 'Dressing mirror', '旋转镜': 'Swivel mirror', '钉镜': 'Fixed mirror', '镜': 'Mirror',
    '插座': 'Power socket', '充电器': 'Charger', '透气网': 'Ventilation grille',
    '消杀机': 'Sanitizer', '背景墙': 'Feature wall', '金属': 'Metal', '玻璃': 'Glass',
    '皮革': 'Leather', '布艺': 'Fabric', '板材': 'Board material', '木地板': 'Wood flooring',
    '瓷砖': 'Tile', '墙砖': 'Wall tile', '地砖': 'Floor tile', '墙面装饰': 'Wall finish',
    '其他柜类': 'Other cabinets', '家具组合': 'Furniture set', '多功能桌': 'Multifunction table',
    '休闲桌椅': 'Lounge table and chairs', '茶几边几': 'Coffee and side tables',
    '餐桌椅': 'Dining tables and chairs', '定制桌台': 'Custom desks', '电器': 'Appliances',
    '卧房': 'Bedroom', '客厅': 'Living room', '餐厅': 'Dining room', '厨房': 'Kitchen',
    '卫生间': 'Bathroom', '阳台': 'Balcony', '书房': 'Study',
    '单层': 'Single-tier', '双层': 'Double-tier', '单列': 'Single-column', '双列': 'Double-column',
    '二列': 'Two-column', '三列': 'Three-column', '单抽': 'One drawer', '双抽': 'Two drawers',
    '三抽': 'Three drawers', '四抽': 'Four drawers', '双门': 'Two doors', '四门': 'Four doors',
    '六门': 'Six doors', '无梯': 'Without ladder', '右开门': 'Right-hinged', '左开门': 'Left-hinged',
    '左款': 'Left version', '右款': 'Right version', '左': 'Left', '右': 'Right',
    '圆形': 'Round', '圆型': 'Round', '方形': 'Rectangular', '椭圆': 'Oval',
    '转角': 'Corner', '一字型': 'Straight', '直排': 'Straight', '折叠': 'Folding',
    '定制': 'Custom', '成品': 'Freestanding', '悬挂': 'Wall-hung', '落地': 'Floor-standing',
    '升降': 'Height-adjustable', '旋转': 'Rotating', '伸缩': 'Extendable',
    '上翻': 'Upward-opening', '下翻': 'Downward-opening', '嵌入式': 'Recessed',
    '内嵌': 'Inset', '侧装': 'Side-mounted', '顶装': 'Top-mounted', '隐藏': 'Concealed',
    '隐形': 'Concealed', '智能': 'Smart', '无线': 'Wireless', '带灯': 'Illuminated',
    '有灯': 'With light', '无灯': 'Without light', '可选': 'Optional', '加固条': 'Reinforcement strip',
    '横纹': 'Horizontal grain', '竖纹': 'Vertical grain', '左后切角': 'Rear-left cutout',
    '右后切角': 'Rear-right cutout', '斜切': 'Bevelled', '倒圆': 'Rounded',
    '铝框': 'Aluminium frame', '活动': 'Adjustable', '固定': 'Fixed', '可定': 'Customizable',
    '无孔': 'Hole-free', '组合': 'Set', '上': 'Upper', '下': 'Lower', '带': 'With',
    '米': 'm', '黑色': 'Black', '白色': 'White', '灰色': 'Grey', '金色': 'Gold',
}
PATTERN = re.compile('|'.join(re.escape(k) for k in sorted(TERMS, key=len, reverse=True)))
CJK = re.compile(r'[\u3400-\u9fff]')
FALLBACK = {'products': 'Cabinet component', 'layouts': 'Furniture object',
            'materials': 'Material finish', 'brands': 'Appliance', 'wall-art': 'Wall art',
            'saved-designs': 'Saved design', 'renders': 'Design render', 'design-items': 'Design furniture'}


def english_label(name, kind='', category=''):
    original = str(name or '').strip()
    if not CJK.search(original):
        if re.fullmatch(r'[A-Z]{3,}[-_][A-Z0-9-]+', original):
            return FALLBACK.get(kind, 'Catalog item') + ' · ' + original
        return original or FALLBACK.get(kind, 'Catalog item')
    translated = PATTERN.sub(lambda m: ' ' + TERMS[m.group()] + ' ', original)
    translated = re.sub(r'[\u3400-\u9fff]+', ' ', translated)
    translated = translated.replace('（', '(').replace('）', ')')
    translated = re.sub(r'\s+', ' ', translated).strip(' -_+，,')
    translated = re.sub(r'\(\s*', '(', translated)
    translated = re.sub(r'\s*\)', ')', translated)
    if not re.search('[A-Za-z]{3}', translated):
        base = TERMS.get(str(category), FALLBACK.get(kind, 'Catalog item'))
        translated = base + (' · ' + translated if translated else '')
    return translated[:400]


def with_english_labels(row):
    row = dict(row)
    name = row.get('name') or row.get('name_as_shown') or row.get('design_name') or row.get('model_reference') or ''
    row['name_en'] = english_label(name, row.get('kind', ''), row.get('category', ''))
    row['english_label_status'] = 'descriptive_translation' if CJK.search(str(name)) else 'source_english_or_code'
    category = row.get('category') or row.get('subcategory') or row.get('category_4') or row.get('room') or ''
    row['category_en'] = english_label(category, row.get('kind', ''))
    return row
