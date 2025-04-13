import requests
import os
import random
import time
from bs4 import BeautifulSoup
import re

# Define the output directory
OUTPUT_DIR = r"C:\code\nameharmony\name-harmony\engine\data"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "names_chinese_mainland.ts")

# User agent list to avoid being blocked
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0'
]

def get_random_user_agent():
    """Get a random user agent from the list."""
    return random.choice(USER_AGENTS)

def extract_names_from_baidu():
    """
    Extract Chinese names from Baidu Baike's name-related pages.
    Baidu Baike has dedicated pages for Chinese surnames and common given names.
    """
    print("Extracting Chinese names from Baidu Baike...")
    
    all_names = []
    
    # URLs for Chinese surnames and given names
    urls = [
        # Common Chinese surnames list
        "https://baike.baidu.com/item/中国姓氏",
        # Male names
        "https://baike.baidu.com/item/男性名字",
        # Female names
        "https://baike.baidu.com/item/女性名字"
    ]
    
    for url in urls:
        try:
            print(f"Accessing: {url}")
            
            headers = {
                'User-Agent': get_random_user_agent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Referer': 'https://www.baidu.com/',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': 'max-age=0'
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            response.encoding = 'utf-8'  # Ensure proper encoding
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Determine gender based on URL
                gender = "surname"
                if "男性" in url:
                    gender = "male"
                elif "女性" in url:
                    gender = "female"
                
                print(f"Processing {gender} names...")
                
                # Strategy for surnames
                if gender == "surname":
                    # Find tables with surname lists
                    tables = soup.find_all('table')
                    for table in tables:
                        # Look for tables with surnames
                        if '姓氏' in table.text or '姓' in table.text:
                            for row in table.find_all('tr'):
                                cells = row.find_all(['td', 'th'])
                                for cell in cells:
                                    # Extract Chinese character and pinyin if available
                                    text = cell.text.strip()
                                    
                                    # Skip headers and empty cells
                                    if not text or re.match(r'^[\d\.]+$', text):
                                        continue
                                    
                                    # Look for Chinese character followed by pinyin in parentheses
                                    match = re.match(r'([一-龥])(?:\s*[（(]\s*([a-zA-Z]+)\s*[）)])?', text)
                                    if match:
                                        surname = match.group(1)
                                        pinyin = match.group(2) if match.group(2) else ""
                                        
                                        # Add to our list
                                        name_entry = {
                                            "name": surname,
                                            "culture": "chinese",
                                            "gender": "surname",
                                            "pinyin": pinyin
                                        }
                                        all_names.append(name_entry)
                    
                    # Look for lists of surnames in paragraphs
                    paragraphs = soup.find_all(['p', 'div', 'span'])
                    for p in paragraphs:
                        text = p.text.strip()
                        if '百家姓' in text or '常见姓氏' in text:
                            # Extract all Chinese characters that are likely surnames
                            chars = re.findall(r'[一-龥]', text)
                            for char in chars:
                                # Simple check: most Chinese surnames are single characters
                                if len(char) == 1:
                                    name_entry = {
                                        "name": char,
                                        "culture": "chinese",
                                        "gender": "surname",
                                        "pinyin": ""  # We don't have pinyin in this context
                                    }
                                    all_names.append(name_entry)
                
                # Strategy for given names
                else:
                    # Find tables or lists with given names
                    paragraphs = soup.find_all(['p', 'div', 'li'])
                    for p in paragraphs:
                        text = p.text.strip()
                        # Look for sections that discuss common names
                        if '常见' in text and ('名字' in text or '名' in text):
                            # Extract name patterns - usually 1-2 characters
                            # Chinese given names can be 1-2 characters
                            name_matches = re.findall(r'[一-龥]{1,2}', text)
                            for name in name_matches:
                                # Filter out likely non-names (too common characters or too long)
                                if len(name) <= 2 and name not in ['的', '是', '了', '我', '你', '他', '她', '有', '和']:
                                    name_entry = {
                                        "name": name,
                                        "culture": "chinese",
                                        "gender": gender,
                                        "pinyin": ""  # We don't have pinyin in this context
                                    }
                                    all_names.append(name_entry)
                    
                    # Find examples of names in tables
                    tables = soup.find_all('table')
                    for table in tables:
                        if '名字' in table.text or '名' in table.text:
                            for row in table.find_all('tr'):
                                cells = row.find_all(['td', 'th'])
                                for cell in cells:
                                    text = cell.text.strip()
                                    # Extract names - usually 1-2 characters
                                    name_matches = re.findall(r'[一-龥]{1,2}', text)
                                    for name in name_matches:
                                        if len(name) <= 2 and name not in ['的', '是', '了', '我', '你', '他', '她', '有', '和']:
                                            name_entry = {
                                                "name": name,
                                                "culture": "chinese",
                                                "gender": gender,
                                                "pinyin": ""  # We don't have pinyin in this context
                                            }
                                            all_names.append(name_entry)
            
            else:
                print(f"Failed to access {url}: {response.status_code}")
                
            # Sleep to avoid rate limiting
            time.sleep(random.uniform(2, 5))
            
        except Exception as e:
            print(f"Error processing {url}: {str(e)}")
    
    # Remove duplicates
    unique_names = []
    seen = set()
    for entry in all_names:
        key = (entry["name"], entry["gender"])
        if key not in seen:
            unique_names.append(entry)
            seen.add(key)
    
    return unique_names

def fetch_common_chinese_names_backup():
    """
    Backup method to fetch common Chinese names from widely available lists.
    This is the same as in the previous script.
    """
    print("Using backup method to fetch common Chinese names...")
    
    # Define common Chinese surnames (with pinyin)
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
        {"name": "罗", "pinyin": "Luo"}
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
        {"name": "浩然", "pinyin": "Haoran"}
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
        {"name": "思怡", "pinyin": "Siyi"}
    ]
    
    # Combine surnames and given names to create full names
    all_names = []
    
    # Add surnames
    for surname in common_surnames:
        all_names.append({
            "name": surname["name"],
            "culture": "chinese",
            "gender": "surname",
            "pinyin": surname["pinyin"]
        })
    
    # Add male given names
    for name in common_male_names:
        all_names.append({
            "name": name["name"],
            "culture": "chinese", 
            "gender": "male",
            "pinyin": name["pinyin"]
        })
    
    # Add female given names
    for name in common_female_names:
        all_names.append({
            "name": name["name"],
            "culture": "chinese",
            "gender": "female", 
            "pinyin": name["pinyin"]
        })
    
    return all_names

def write_to_typescript(names, output_file):
    """
    Writes the name data to a TypeScript file similar to the Italian names format.
    """
    print(f"Writing {len(names)} names to TypeScript file...")
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    ts_content = "export const CHINESE_NAMES = [\n"
    
    for name_entry in names:
        entry = "  {\n"
        entry += f'    "name": "{name_entry["name"]}",\n'
        entry += f'    "culture": "{name_entry["culture"]}",\n'
        entry += f'    "gender": "{name_entry["gender"]}"'
        
        # Add pinyin if available
        if "pinyin" in name_entry and name_entry["pinyin"]:
            entry += f',\n    "pinyin": "{name_entry["pinyin"]}"'
        
        entry += "\n  },\n"
        ts_content += entry
    
    ts_content += "];\n"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(ts_content)
    
    print(f"Names successfully written to {output_file}")

def main():
    try:
        # Try to get names from Baidu Baike
        names = extract_names_from_baidu()
        
        # If we couldn't get enough names, use backup method
        if len(names) < 50:
            print(f"Only found {len(names)} names from primary source. Using backup method...")
            backup_names = fetch_common_chinese_names_backup()
            
            # Combine unique names from both sources
            existing_names = set((entry["name"], entry["gender"]) for entry in names)
            for entry in backup_names:
                if (entry["name"], entry["gender"]) not in existing_names:
                    names.append(entry)
                    existing_names.add((entry["name"], entry["gender"]))
        
        # Write to TypeScript file
        write_to_typescript(names, OUTPUT_FILE)
        print(f"Total names collected: {len(names)}")
        
    except Exception as e:
        print(f"Error in main process: {str(e)}")
        print("Using backup method due to error...")
        names = fetch_common_chinese_names_backup()
        write_to_typescript(names, OUTPUT_FILE)
        print(f"Total names collected: {len(names)}")

if __name__ == "__main__":
    main()