import requests
import pandas as pd
import json
import os
from bs4 import BeautifulSoup
import re

# Define the output directory
OUTPUT_DIR = r"C:\code\nameharmony\name-harmony\engine\data"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "names_chinese_taiwan.ts")

def get_taiwan_top_names():
    """
    Retrieves top baby names data from Taiwan's MOI open data portal.
    
    Taiwan MOI publishes top baby names annually.
    This function fetches this data and processes it into our required format.
    """
    print("Fetching Taiwan MOI baby names data...")
    
    # Taiwan's open data portal has baby name data in specific formats
    # The actual URL might need adjusting based on the current year
    urls = [
        "https://data.gov.tw/dataset/41619",  # Male baby names
        "https://data.gov.tw/dataset/41617"   # Female baby names
    ]
    
    all_names = []
    
    for url in urls:
        try:
            print(f"Accessing: {url}")
            response = requests.get(url)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Find gender
                gender = "male" if "41619" in url else "female"
                print(f"Processing {gender} names...")
                
                # Look for downloadable CSV files
                download_links = [a['href'] for a in soup.find_all('a', href=True) 
                                 if a['href'].endswith('.csv') or a['href'].endswith('.json')]
                
                if download_links:
                    for link in download_links:
                        try:
                            if not link.startswith('http'):
                                if link.startswith('/'):
                                    link = f"https://data.gov.tw{link}"
                                else:
                                    link = f"https://data.gov.tw/{link}"
                                    
                            print(f"Downloading: {link}")
                            data_response = requests.get(link)
                            
                            if data_response.status_code == 200:
                                # Process based on file type
                                if link.endswith('.csv'):
                                    # Save temp file and read with pandas to handle encoding
                                    with open('temp_names.csv', 'wb') as f:
                                        f.write(data_response.content)
                                    
                                    df = pd.read_csv('temp_names.csv', encoding='utf-8', 
                                                     on_bad_lines='skip')
                                    
                                    # Clean up temp file
                                    if os.path.exists('temp_names.csv'):
                                        os.remove('temp_names.csv')
                                    
                                    # Extract name data
                                    for _, row in df.iterrows():
                                        # Find the columns with name, rank, pinyin info
                                        # Column names may vary, so we'll need to detect them
                                        name_col = None
                                        pinyin_col = None
                                        
                                        for col in df.columns:
                                            # Look for columns that might contain Chinese characters
                                            if any('\u4e00' <= c <= '\u9fff' for c in str(row[col])):
                                                name_col = col
                                            # Look for columns that might contain pinyin
                                            elif re.search(r'[a-zA-Z]', str(row[col])) and not pinyin_col:
                                                pinyin_col = col
                                        
                                        if name_col:
                                            name_chars = str(row[name_col]).strip()
                                            pinyin = str(row[pinyin_col]).strip() if pinyin_col else ""
                                            
                                            name_entry = {
                                                "name": name_chars,
                                                "culture": "chinese",
                                                "gender": gender,
                                                "pinyin": pinyin
                                            }
                                            all_names.append(name_entry)
                                
                                elif link.endswith('.json'):
                                    data = data_response.json()
                                    # Process JSON data based on its structure
                                    # We'd need to adapt this to the actual JSON structure
                                    if isinstance(data, list):
                                        for item in data:
                                            # Extract name and pinyin based on JSON structure
                                            # This is a placeholder - adjust to actual structure
                                            name_chars = item.get('name', '')
                                            pinyin = item.get('pinyin', '')
                                            
                                            name_entry = {
                                                "name": name_chars,
                                                "culture": "chinese",
                                                "gender": gender,
                                                "pinyin": pinyin
                                            }
                                            all_names.append(name_entry)
                            else:
                                print(f"Failed to download data: {data_response.status_code}")
                        except Exception as e:
                            print(f"Error processing link {link}: {str(e)}")
                else:
                    # Fallback: Try to find tables directly on the page
                    tables = soup.find_all('table')
                    if tables:
                        for table in tables:
                            rows = table.find_all('tr')
                            for row in rows[1:]:  # Skip header row
                                cells = row.find_all('td')
                                if len(cells) >= 2:
                                    name_chars = cells[0].text.strip()
                                    pinyin = cells[1].text.strip() if len(cells) > 1 else ""
                                    
                                    # Only add if it contains Chinese characters
                                    if any('\u4e00' <= c <= '\u9fff' for c in name_chars):
                                        name_entry = {
                                            "name": name_chars,
                                            "culture": "chinese",
                                            "gender": gender,
                                            "pinyin": pinyin
                                        }
                                        all_names.append(name_entry)
            else:
                print(f"Failed to access {url}: {response.status_code}")
        except Exception as e:
            print(f"Error processing {url}: {str(e)}")
    
    return all_names

def fetch_common_chinese_names_backup():
    """
    Backup method to fetch common Chinese names from widely available lists.
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
        # Try to get names from Taiwan MOI
        names = get_taiwan_top_names()
        
        # If we couldn't get enough names, use backup method
        if len(names) < 50:
            print(f"Only found {len(names)} names from primary source. Using backup method...")
            backup_names = fetch_common_chinese_names_backup()
            
            # Combine unique names from both sources
            existing_names = set(entry["name"] for entry in names)
            for entry in backup_names:
                if entry["name"] not in existing_names:
                    names.append(entry)
                    existing_names.add(entry["name"])
        
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