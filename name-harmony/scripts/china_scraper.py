import requests
import os
import random
import time
from bs4 import BeautifulSoup
import re

# Define the output directory
OUTPUT_DIR = r"C:\code\nameharmony\name-harmony\engine\data"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "names_chinese_improved.ts")

# User agent list to avoid being blocked
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0'
]

# Common Chinese character to pinyin mapping for frequent characters
COMMON_CHAR_TO_PINYIN = {
    # Common surnames
    "王": "Wang", "李": "Li", "张": "Zhang", "刘": "Liu", "陈": "Chen", 
    "杨": "Yang", "黄": "Huang", "赵": "Zhao", "吴": "Wu", "周": "Zhou",
    "徐": "Xu", "孙": "Sun", "马": "Ma", "朱": "Zhu", "胡": "Hu",
    "林": "Lin", "郭": "Guo", "何": "He", "高": "Gao", "罗": "Luo",
    
    # Common given name characters (male)
    "伟": "Wei", "强": "Qiang", "磊": "Lei", "明": "Ming", "东": "Dong",
    "杰": "Jie", "建": "Jian", "文": "Wen", "辉": "Hui", "宇": "Yu",
    "昊": "Hao", "浩": "Hao", "凯": "Kai", "鹏": "Peng", "鑫": "Xin",
    
    # Common given name characters (female)
    "芳": "Fang", "娜": "Na", "敏": "Min", "静": "Jing", "丽": "Li",
    "艳": "Yan", "娟": "Juan", "霞": "Xia", "萍": "Ping", "玲": "Ling",
    "婷": "Ting", "雪": "Xue", "琳": "Lin", "欣": "Xin", "莹": "Ying",
    
    # Other common characters in names
    "小": "Xiao", "中": "Zhong", "大": "Da", "国": "Guo", "天": "Tian",
    "长": "Chang", "山": "Shan", "水": "Shui", "金": "Jin", "土": "Tu",
    "江": "Jiang", "河": "He", "湖": "Hu", "海": "Hai", "云": "Yun",
    "花": "Hua", "草": "Cao", "木": "Mu", "田": "Tian", "风": "Feng",
    "雨": "Yu", "雷": "Lei", "电": "Dian", "石": "Shi", "火": "Huo"
}

def get_random_user_agent():
    """Get a random user agent from the list."""
    return random.choice(USER_AGENTS)

def convert_to_pinyin(chinese_chars):
    """
    Convert Chinese characters to pinyin using our dictionary.
    
    Args:
        chinese_chars: The Chinese characters to convert
        
    Returns:
        The pinyin transliteration or empty string if conversion fails
    """
    # For empty input, return empty string
    if not chinese_chars:
        return ""
    
    # Check if we have a direct mapping for the entire string
    if chinese_chars in COMMON_CHAR_TO_PINYIN:
        return COMMON_CHAR_TO_PINYIN[chinese_chars]
    
    # For multi-character strings, try to build pinyin character by character
    if len(chinese_chars) > 1:
        result = []
        for char in chinese_chars:
            if char in COMMON_CHAR_TO_PINYIN:
                result.append(COMMON_CHAR_TO_PINYIN[char])
            else:
                # If we don't have this character, use a placeholder
                result.append("?")
        
        return "".join(result)
    
    # For single characters not in our dictionary, return empty string
    return ""

def extract_names_from_baidu():
    """
    Extract Chinese names from Baidu Baike using more reliable URLs
    """
    print("Extracting Chinese names from Baidu Baike...")
    
    all_names = []
    
    # More specific and verified URLs for Baidu Baike
    baidu_urls = [
        # Chinese surnames encyclopedia page
        "https://baike.baidu.com/item/百家姓/1719115",
        # General Chinese name page
        "https://baike.baidu.com/item/中国人名/1785347",
        # Popular Chinese names
        "https://baike.baidu.com/item/常见名字"
    ]
    
    session = requests.Session()
    
    for url in baidu_urls:
        try:
            print(f"Accessing: {url}")
            
            headers = {
                'User-Agent': get_random_user_agent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Referer': 'https://www.baidu.com/',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': 'max-age=0',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-User': '?1'
            }
            
            response = session.get(url, headers=headers, timeout=15)
            response.encoding = 'utf-8'  # Ensure proper encoding
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Determine name type and gender based on URL and content
                name_type = "given_name"  # Default
                gender = None
                
                if "百家姓" in url or "姓氏" in url:
                    name_type = "surname"
                elif "男" in response.text[:5000]:  # Check first 5000 chars for context
                    gender = "male"
                elif "女" in response.text[:5000]:
                    gender = "female"
                
                print(f"Processing {name_type} names" + (f" ({gender})" if gender else ""))
                
                # Find tables which often contain organized name information
                tables = soup.find_all('table')
                for table in tables:
                    # Process each row in the table
                    for row in table.find_all('tr'):
                        cells = row.find_all(['td', 'th'])
                        for cell in cells:
                            # Extract Chinese characters
                            text = cell.text.strip()
                            chinese_matches = re.findall(r'[\u4e00-\u9fff]+', text)
                            
                            for match in chinese_matches:
                                # Process based on name type
                                if name_type == "surname" and 1 <= len(match) <= 2:
                                    for char in match:
                                        # Most Chinese surnames are single characters
                                        pinyin = convert_to_pinyin(char)
                                        name_entry = {
                                            "name": char,
                                            "culture": "chinese",
                                            "type": "surname",
                                            "pinyin": pinyin
                                        }
                                        all_names.append(name_entry)
                                        
                                elif name_type == "given_name" and 1 <= len(match) <= 2:
                                    # Most Chinese given names are 1-2 characters
                                    pinyin = convert_to_pinyin(match)
                                    name_entry = {
                                        "name": match,
                                        "culture": "chinese",
                                        "type": "given_name",
                                        "gender": gender,
                                        "pinyin": pinyin
                                    }
                                    all_names.append(name_entry)
                
                # Also look for lists which might contain names
                lists = soup.find_all(['ul', 'ol'])
                for list_elem in lists:
                    items = list_elem.find_all('li')
                    for item in items:
                        text = item.text.strip()
                        chinese_matches = re.findall(r'[\u4e00-\u9fff]+', text)
                        
                        for match in chinese_matches:
                            if name_type == "surname" and 1 <= len(match) <= 2:
                                for char in match:
                                    pinyin = convert_to_pinyin(char)
                                    name_entry = {
                                        "name": char,
                                        "culture": "chinese",
                                        "type": "surname",
                                        "pinyin": pinyin
                                    }
                                    all_names.append(name_entry)
                                    
                            elif name_type == "given_name" and 1 <= len(match) <= 2:
                                pinyin = convert_to_pinyin(match)
                                name_entry = {
                                    "name": match,
                                    "culture": "chinese",
                                    "type": "given_name",
                                    "gender": gender,
                                    "pinyin": pinyin
                                }
                                all_names.append(name_entry)
                
                # Look through paragraphs for names
                paragraphs = soup.find_all(['p', 'div.para'])
                for para in paragraphs:
                    text = para.text.strip()
                    
                    # If paragraph mentions names or contains lists of names
                    if "名字" in text or "姓名" in text or "姓氏" in text:
                        chinese_matches = re.findall(r'[\u4e00-\u9fff]+', text)
                        
                        for match in chinese_matches:
                            if name_type == "surname" and len(match) == 1:
                                pinyin = convert_to_pinyin(match)
                                name_entry = {
                                    "name": match,
                                    "culture": "chinese",
                                    "type": "surname",
                                    "pinyin": pinyin
                                }
                                all_names.append(name_entry)
                                
                            elif name_type == "given_name" and 1 <= len(match) <= 2:
                                # For given names, check if we can determine gender from context
                                local_gender = gender
                                if not local_gender:
                                    if "男" in text[:100]:  # Check nearby context
                                        local_gender = "male"
                                    elif "女" in text[:100]:
                                        local_gender = "female"
                                
                                pinyin = convert_to_pinyin(match)
                                name_entry = {
                                    "name": match,
                                    "culture": "chinese",
                                    "type": "given_name",
                                    "gender": local_gender,
                                    "pinyin": pinyin
                                }
                                all_names.append(name_entry)
            
            else:
                print(f"Failed to access {url}: {response.status_code}")
                
            # Sleep to avoid rate limiting
            time.sleep(random.uniform(3, 7))
            
        except Exception as e:
            print(f"Error processing {url}: {str(e)}")
    
    return all_names

def extract_names_from_wiki_sources():
    """
    Extract Chinese names from Wikipedia's lists of common Chinese names
    This is more reliable than some Chinese sites that block scrapers
    """
    print("Extracting Chinese names from Wikipedia sources...")
    
    all_names = []
    
    # Wikipedia pages with Chinese name information (English Wikipedia is more accessible)
    wiki_urls = [
        "https://en.wikipedia.org/wiki/Chinese_surname",
        "https://en.wikipedia.org/wiki/Chinese_given_name"
    ]
    
    session = requests.Session()
    
    for url in wiki_urls:
        try:
            print(f"Accessing: {url}")
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
            
            response = session.get(url, headers=headers, timeout=15)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Determine name type based on URL
                name_type = "surname" if "surname" in url.lower() else "given_name"
                print(f"Processing {name_type} names from Wikipedia")
                
                # Find tables which are well-structured in Wikipedia
                tables = soup.find_all('table', class_='wikitable')
                
                for table in tables:
                    # Process each row in the table
                    for row in table.find_all('tr')[1:]:  # Skip header row
                        cells = row.find_all(['td', 'th'])
                        
                        if len(cells) >= 2:
                            # In Wikipedia tables, typically one column has Chinese and another has pinyin
                            chinese_chars = None
                            pinyin = None
                            gender = None
                            
                            # Try to locate Chinese characters and pinyin in the row
                            for cell in cells:
                                text = cell.text.strip()
                                
                                # Check if cell contains Chinese characters
                                if re.search(r'[\u4e00-\u9fff]', text) and not chinese_chars:
                                    chinese_chars = re.findall(r'[\u4e00-\u9fff]+', text)[0]
                                
                                # Check if cell might contain pinyin (simple heuristic)
                                elif re.match(r'^[a-zA-Z]+$', text) and not pinyin:
                                    pinyin = text
                                
                                # Check for gender indicators
                                if name_type == "given_name":
                                    if "male" in text.lower() or "boy" in text.lower():
                                        gender = "male"
                                    elif "female" in text.lower() or "girl" in text.lower():
                                        gender = "female"
                            
                            # If we found Chinese characters, add to our list
                            if chinese_chars:
                                if name_type == "surname":
                                    # Handle each character as a potential surname
                                    for char in chinese_chars:
                                        char_pinyin = pinyin if len(chinese_chars) == 1 else convert_to_pinyin(char)
                                        name_entry = {
                                            "name": char,
                                            "culture": "chinese",
                                            "type": "surname",
                                            "pinyin": char_pinyin
                                        }
                                        all_names.append(name_entry)
                                else:
                                    # For given names, use the complete match
                                    name_entry = {
                                        "name": chinese_chars,
                                        "culture": "chinese",
                                        "type": "given_name",
                                        "pinyin": pinyin or convert_to_pinyin(chinese_chars)
                                    }
                                    if gender:
                                        name_entry["gender"] = gender
                                    all_names.append(name_entry)
                
                # Also look for lists which might contain names
                lists = soup.find_all(['ul', 'ol'])
                for list_elem in lists:
                    items = list_elem.find_all('li')
                    for item in items:
                        text = item.text.strip()
                        
                        # Check if list item contains Chinese characters
                        chinese_match = re.search(r'([\u4e00-\u9fff]+)', text)
                        if chinese_match:
                            chinese_chars = chinese_match.group(1)
                            
                            # Try to find pinyin nearby
                            pinyin_match = re.search(r'([A-Za-z]+)', text)
                            pinyin = pinyin_match.group(1) if pinyin_match else ""
                            
                            if name_type == "surname" and len(chinese_chars) <= 2:
                                for char in chinese_chars:
                                    name_entry = {
                                        "name": char,
                                        "culture": "chinese",
                                        "type": "surname",
                                        "pinyin": pinyin or convert_to_pinyin(char)
                                    }
                                    all_names.append(name_entry)
                            elif name_type == "given_name" and len(chinese_chars) <= 2:
                                # Determine gender if possible
                                gender = None
                                if "male" in text.lower():
                                    gender = "male"
                                elif "female" in text.lower():
                                    gender = "female"
                                
                                name_entry = {
                                    "name": chinese_chars,
                                    "culture": "chinese",
                                    "type": "given_name",
                                    "pinyin": pinyin or convert_to_pinyin(chinese_chars)
                                }
                                if gender:
                                    name_entry["gender"] = gender
                                all_names.append(name_entry)
            
            else:
                print(f"Failed to access {url}: {response.status_code}")
                
            # Sleep to avoid rate limiting
            time.sleep(random.uniform(2, 5))
            
        except Exception as e:
            print(f"Error processing {url}: {str(e)}")
    
    return all_names

def fetch_common_chinese_names_backup():
    """
    Comprehensive backup method to fetch common Chinese names.
    Uses proper type and gender classifications.
    """
    print("Preparing backup Chinese names data...")
    
    all_names = []
    
    # Define common Chinese surnames with pinyin
    common_surnames = [
        {"name": "王", "pinyin": "Wang"},
        {"name": "李", "pinyin": "Li"},
        {"name": "张", "pinyin": "Zhang"},
        {"name": "刘", "pinyin": "Liu"},
        {"name": "陈", "pinyin": "Chen"},
        {"name": "杨", "pinyin": "Yang"},
        {"name": "黄", "pinyin": "Huang"},
        {"name": "赵", "pinyin": "Zhao"},
        {"name": "吴", "pinyin": "Wu"},
        {"name": "周", "pinyin": "Zhou"},
        {"name": "徐", "pinyin": "Xu"},
        {"name": "孙", "pinyin": "Sun"},
        {"name": "马", "pinyin": "Ma"},
        {"name": "朱", "pinyin": "Zhu"},
        {"name": "胡", "pinyin": "Hu"},
        {"name": "林", "pinyin": "Lin"},
        {"name": "郭", "pinyin": "Guo"},
        {"name": "何", "pinyin": "He"},
        {"name": "高", "pinyin": "Gao"},
        {"name": "罗", "pinyin": "Luo"},
        {"name": "郑", "pinyin": "Zheng"},
        {"name": "梁", "pinyin": "Liang"},
        {"name": "谢", "pinyin": "Xie"},
        {"name": "宋", "pinyin": "Song"},
        {"name": "唐", "pinyin": "Tang"},
        {"name": "许", "pinyin": "Xu"},
        {"name": "韩", "pinyin": "Han"},
        {"name": "冯", "pinyin": "Feng"},
        {"name": "邓", "pinyin": "Deng"},
        {"name": "曹", "pinyin": "Cao"},
        {"name": "彭", "pinyin": "Peng"},
        {"name": "曾", "pinyin": "Zeng"},
        {"name": "萧", "pinyin": "Xiao"},
        {"name": "田", "pinyin": "Tian"},
        {"name": "董", "pinyin": "Dong"},
        {"name": "袁", "pinyin": "Yuan"},
        {"name": "潘", "pinyin": "Pan"},
        {"name": "蒋", "pinyin": "Jiang"},
        {"name": "蔡", "pinyin": "Cai"},
        {"name": "余", "pinyin": "Yu"},
        {"name": "杜", "pinyin": "Du"},
        {"name": "叶", "pinyin": "Ye"},
        {"name": "程", "pinyin": "Cheng"},
        {"name": "苏", "pinyin": "Su"},
        {"name": "魏", "pinyin": "Wei"},
        {"name": "吕", "pinyin": "Lü"},
        {"name": "丁", "pinyin": "Ding"},
        {"name": "任", "pinyin": "Ren"},
        {"name": "沈", "pinyin": "Shen"},
        {"name": "姚", "pinyin": "Yao"}
    ]
    
    # Define common male given names
    common_male_names = [
        {"name": "伟", "pinyin": "Wei"},
        {"name": "强", "pinyin": "Qiang"},
        {"name": "磊", "pinyin": "Lei"},
        {"name": "明", "pinyin": "Ming"},
        {"name": "东", "pinyin": "Dong"},
        {"name": "杰", "pinyin": "Jie"},
        {"name": "建", "pinyin": "Jian"},
        {"name": "文", "pinyin": "Wen"},
        {"name": "辉", "pinyin": "Hui"},
        {"name": "宇", "pinyin": "Yu"},
        {"name": "昊", "pinyin": "Hao"},
        {"name": "浩", "pinyin": "Hao"},
        {"name": "凯", "pinyin": "Kai"},
        {"name": "鹏", "pinyin": "Peng"},
        {"name": "鑫", "pinyin": "Xin"},
        {"name": "志强", "pinyin": "Zhiqiang"},
        {"name": "玉龙", "pinyin": "Yulong"},
        {"name": "家豪", "pinyin": "Jiahao"},
        {"name": "子豪", "pinyin": "Zihao"},
        {"name": "浩然", "pinyin": "Haoran"},
        {"name": "瑞", "pinyin": "Rui"},
        {"name": "涛", "pinyin": "Tao"},
        {"name": "昌", "pinyin": "Chang"},
        {"name": "达", "pinyin": "Da"},
        {"name": "安", "pinyin": "An"},
        {"name": "博", "pinyin": "Bo"},
        {"name": "祥", "pinyin": "Xiang"},
        {"name": "天", "pinyin": "Tian"},
        {"name": "阳", "pinyin": "Yang"},
        {"name": "思源", "pinyin": "Siyuan"},
        {"name": "智辉", "pinyin": "Zhihui"},
        {"name": "弘毅", "pinyin": "Hongyi"},
        {"name": "俊杰", "pinyin": "Junjie"},
        {"name": "雨泽", "pinyin": "Yuze"},
        {"name": "烨华", "pinyin": "Yehua"},
        {"name": "泽洋", "pinyin": "Zeyang"},
        {"name": "鸿煊", "pinyin": "Hongxuan"},
        {"name": "博涛", "pinyin": "Botao"},
        {"name": "苑博", "pinyin": "Yuanbo"},
        {"name": "炎彬", "pinyin": "Yanbin"}
    ]
    
    # Define common female given names
    common_female_names = [
        {"name": "芳", "pinyin": "Fang"},
        {"name": "娜", "pinyin": "Na"},
        {"name": "敏", "pinyin": "Min"},
        {"name": "静", "pinyin": "Jing"},
        {"name": "秀英", "pinyin": "Xiuying"},
        {"name": "丽", "pinyin": "Li"},
        {"name": "艳", "pinyin": "Yan"},
        {"name": "娟", "pinyin": "Juan"},
        {"name": "霞", "pinyin": "Xia"},
        {"name": "萍", "pinyin": "Ping"},
        {"name": "玲", "pinyin": "Ling"},
        {"name": "婷", "pinyin": "Ting"},
        {"name": "雪", "pinyin": "Xue"},
        {"name": "琳", "pinyin": "Lin"},
        {"name": "欣", "pinyin": "Xin"},
        {"name": "晓燕", "pinyin": "Xiaoyan"},
        {"name": "小玉", "pinyin": "Xiaoyu"},
        {"name": "雅婷", "pinyin": "Yating"},
        {"name": "雨婷", "pinyin": "Yuting"},
        {"name": "思怡", "pinyin": "Siyi"},
        {"name": "颖", "pinyin": "Ying"},
        {"name": "倩", "pinyin": "Qian"},
        {"name": "彤", "pinyin": "Tong"},
        {"name": "妍", "pinyin": "Yan"},
        {"name": "瑶", "pinyin": "Yao"},
        {"name": "莉", "pinyin": "Li"},
        {"name": "璐", "pinyin": "Lu"},
        {"name": "蓉", "pinyin": "Rong"},
        {"name": "云", "pinyin": "Yun"},
        {"name": "怡然", "pinyin": "Yiran"},
        {"name": "诗涵", "pinyin": "Shihan"},
        {"name": "佳怡", "pinyin": "Jiayi"},
        {"name": "梦瑶", "pinyin": "Mengyao"},
        {"name": "思颖", "pinyin": "Siying"},
        {"name": "雅芙", "pinyin": "Yafu"},
        {"name": "嘉欣", "pinyin": "Jiaxin"},
        {"name": "雨桐", "pinyin": "Yutong"},
        {"name": "美琪", "pinyin": "Meiqi"},
        {"name": "语嫣", "pinyin": "Yuyan"},
        {"name": "筱筱", "pinyin": "Xiaoxiao"}
    ]
    
    # Add surnames with proper type classification
    for surname in common_surnames:
        all_names.append({
            "name": surname["name"],
            "culture": "chinese",
            "type": "surname",
            "pinyin": surname["pinyin"]
        })
    
    # Add male given names with proper type and gender classification
    for name in common_male_names:
        all_names.append({
            "name": name["name"],
            "culture": "chinese",
            "type": "given_name",
            "gender": "male",
            "pinyin": name["pinyin"]
        })
    
    # Add female given names with proper type and gender classification
    for name in common_female_names:
        all_names.append({
            "name": name["name"],
            "culture": "chinese",
            "type": "given_name",
            "gender": "female",
            "pinyin": name["pinyin"]
        })
    
    return all_names

def write_to_typescript(names, output_file):
    """
    Writes the name data to a TypeScript file similar to the Italian names format,
    but with improved structure for Chinese names.
    """
    print(f"Writing {len(names)} names to TypeScript file...")
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    ts_content = "export const CHINESE_NAMES = [\n"
    
    for name_entry in names:
        entry = "  {\n"
        entry += f'    "name": "{name_entry["name"]}",\n'
        entry += f'    "culture": "{name_entry["culture"]}",\n'
        
        # Add type (surname or given_name)
        if "type" in name_entry:
            entry += f'    "type": "{name_entry["type"]}",\n'
        
        # Add gender only for given names
        if "gender" in name_entry and name_entry.get("gender"):
            entry += f'    "gender": "{name_entry["gender"]}",\n'
        
        # Add pinyin if available (remove trailing comma from last property)
        if "pinyin" in name_entry and name_entry["pinyin"]:
            entry += f'    "pinyin": "{name_entry["pinyin"]}"\n'
        else:
            # Remove trailing comma from the previous line
            entry = entry.rstrip(',\n') + '\n'
        
        entry += "  },\n"
        ts_content += entry
    
    ts_content += "];\n"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(ts_content)
    
    print(f"Names successfully written to {output_file}")

def main():
    try:
        # Start with our backup data as a foundation
        names = fetch_common_chinese_names_backup()
        print(f"Loaded {len(names)} names from backup data")
        
        # Try to get additional names from Baidu Baike
        try:
            baidu_names = extract_names_from_baidu()
            print(f"Extracted {len(baidu_names)} names from Baidu Baike")
            
            # Add unique names from Baidu
            existing_names = set((entry["name"], entry.get("type", "")) for entry in names)
            for entry in baidu_names:
                key = (entry["name"], entry.get("type", ""))
                if key not in existing_names:
                    names.append(entry)
                    existing_names.add(key)
        except Exception as e:
            print(f"Error extracting names from Baidu: {str(e)}")
        
        # Try to get additional names from Wikipedia
        try:
            wiki_names = extract_names_from_wiki_sources()
            print(f"Extracted {len(wiki_names)} names from Wikipedia")
            
            # Add unique names from Wikipedia
            existing_names = set((entry["name"], entry.get("type", "")) for entry in names)
            for entry in wiki_names:
                key = (entry["name"], entry.get("type", ""))
                if key not in existing_names:
                    names.append(entry)
                    existing_names.add(key)
        except Exception as e:
            print(f"Error extracting names from Wikipedia: {str(e)}")
        
        # Write to TypeScript file with improved structure
        write_to_typescript(names, OUTPUT_FILE)
        print(f"Total names collected: {len(names)}")
        
    except Exception as e:
        print(f"Error in main process: {str(e)}")
        print("Using backup method only due to error...")
        names = fetch_common_chinese_names_backup()
        write_to_typescript(names, OUTPUT_FILE)
        print(f"Total names collected: {len(names)}")

if __name__ == "__main__":
    main()