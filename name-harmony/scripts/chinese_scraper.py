import requests
import os
import random
import time
from bs4 import BeautifulSoup
import re

# Define the output directory
OUTPUT_DIR = r"C:\code\nameharmony\name-harmony\engine\data"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "names_chinese_network.ts")

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

def extract_names_from_chinese_name_network():
    """
    Extract Chinese names from the Chinese Name Network (中国人名网).
    """
    print("Extracting Chinese names from Chinese Name Network (中国人名网)...")
    
    all_names = []
    
    # Base URL for the Chinese Name Network
    base_url = "http://www.yourchinesename.com"
    
    # URLs for different sections of Chinese names
    urls = [
        # Popular male names
        f"{base_url}/name/boy/",  
        # Popular female names
        f"{base_url}/name/girl/",
        # Common surnames
        f"{base_url}/surname/"
    ]
    
    for url in urls:
        try:
            print(f"Accessing: {url}")
            
            headers = {
                'User-Agent': get_random_user_agent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': 'max-age=0'
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            response.encoding = 'utf-8'  # Ensure proper encoding
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Determine gender/type based on URL
                gender = "male"
                if "/girl/" in url:
                    gender = "female"
                elif "/surname/" in url:
                    gender = "surname"
                
                print(f"Processing {gender} names...")
                
                # Extract name elements based on the website's structure
                # The actual CSS selectors may need adjustment based on the site's HTML
                name_elements = soup.select('div.name-item, li.name-item, div.name-box, table.name-list tr')
                
                for elem in name_elements:
                    # Try to extract Chinese character and pinyin
                    chinese_char = ""
                    pinyin = ""
                    
                    # Look for Chinese characters
                    char_elem = elem.select_one('.chinese-char, .name-chinese')
                    if char_elem:
                        chinese_char = char_elem.text.strip()
                    else:
                        # Try to find Chinese characters in the element text
                        text = elem.text.strip()
                        chinese_matches = re.findall(r'[\u4e00-\u9fff]+', text)
                        if chinese_matches:
                            chinese_char = chinese_matches[0]
                    
                    # Look for pinyin
                    pinyin_elem = elem.select_one('.pinyin, .name-pinyin')
                    if pinyin_elem:
                        pinyin = pinyin_elem.text.strip()
                    else:
                        # Try to find pinyin in the element text
                        text = elem.text.strip()
                        pinyin_matches = re.findall(r'[a-zA-Z]+', text)
                        if pinyin_matches:
                            # Filter out common non-pinyin English words
                            non_pinyin = ['div', 'span', 'class', 'the', 'and', 'for', 'name']
                            filtered_pinyin = [p for p in pinyin_matches if p.lower() not in non_pinyin and len(p) > 1]
                            if filtered_pinyin:
                                pinyin = filtered_pinyin[0]
                    
                    # Only add if we found a Chinese character
                    if chinese_char and re.search(r'[\u4e00-\u9fff]', chinese_char):
                        name_entry = {
                            "name": chinese_char,
                            "culture": "chinese",
                            "gender": gender,
                            "pinyin": pinyin
                        }
                        all_names.append(name_entry)
                
                # If we're on a page with pagination, try to get names from additional pages
                pagination = soup.select('div.pagination a, ul.pagination li a')
                additional_pages = []
                
                for page_link in pagination:
                    href = page_link.get('href')
                    if href and href != '#' and href not in additional_pages:
                        if not href.startswith('http'):
                            href = base_url + href if href.startswith('/') else base_url + '/' + href
                        additional_pages.append(href)
                
                # Limit to max 5 additional pages to avoid too many requests
                additional_pages = additional_pages[:5]
                
                for page_url in additional_pages:
                    try:
                        print(f"Accessing additional page: {page_url}")
                        
                        page_response = requests.get(page_url, headers=headers, timeout=10)
                        page_response.encoding = 'utf-8'
                        
                        if page_response.status_code == 200:
                            page_soup = BeautifulSoup(page_response.text, 'html.parser')
                            
                            # Extract names from this page too
                            page_name_elements = page_soup.select('div.name-item, li.name-item, div.name-box, table.name-list tr')
                            
                            for elem in page_name_elements:
                                chinese_char = ""
                                pinyin = ""
                                
                                char_elem = elem.select_one('.chinese-char, .name-chinese')
                                if char_elem:
                                    chinese_char = char_elem.text.strip()
                                else:
                                    text = elem.text.strip()
                                    chinese_matches = re.findall(r'[\u4e00-\u9fff]+', text)
                                    if chinese_matches:
                                        chinese_char = chinese_matches[0]
                                
                                pinyin_elem = elem.select_one('.pinyin, .name-pinyin')
                                if pinyin_elem:
                                    pinyin = pinyin_elem.text.strip()
                                else:
                                    text = elem.text.strip()
                                    pinyin_matches = re.findall(r'[a-zA-Z]+', text)
                                    if pinyin_matches:
                                        non_pinyin = ['div', 'span', 'class', 'the', 'and', 'for', 'name']
                                        filtered_pinyin = [p for p in pinyin_matches if p.lower() not in non_pinyin and len(p) > 1]
                                        if filtered_pinyin:
                                            pinyin = filtered_pinyin[0]
                                
                                if chinese_char and re.search(r'[\u4e00-\u9fff]', chinese_char):
                                    name_entry = {
                                        "name": chinese_char,
                                        "culture": "chinese",
                                        "gender": gender,
                                        "pinyin": pinyin
                                    }
                                    all_names.append(name_entry)
                        
                        # Sleep to avoid rate limiting
                        time.sleep(random.uniform(1, 3))
                        
                    except Exception as e:
                        print(f"Error processing additional page {page_url}: {str(e)}")
            
            else:
                print(f"Failed to access {url}: {response.status_code}")
                
            # Sleep to avoid rate limiting
            time.sleep(random.uniform(2, 5))
            
        except Exception as e:
            print(f"Error processing {url}: {str(e)}")
    
    # Try alternative method: search for common name patterns
    try:
        search_url = f"{base_url}/search/"
        common_searches = ["李", "王", "张", "陈", "刘", "杨", "赵", "黄", "周", "吴"]
        
        for search_term in common_searches:
            try:
                print(f"Searching for names related to: {search_term}")
                
                search_response = requests.get(
                    f"{search_url}?q={search_term}",
                    headers={'User-Agent': get_random_user_agent()},
                    timeout=10
                )
                search_response.encoding = 'utf-8'
                
                if search_response.status_code == 200:
                    search_soup = BeautifulSoup(search_response.text, 'html.parser')
                    
                    # Look for search results containing names
                    results = search_soup.select('div.search-result, div.name-result, div.result-item')
                    
                    for result in results:
                        text = result.text.strip()
                        
                        # Extract Chinese characters and possible pinyin
                        chinese_chars = re.findall(r'[\u4e00-\u9fff]+', text)
                        pinyin_candidates = re.findall(r'[a-zA-Z]+', text)
                        
                        if chinese_chars:
                            # Try to determine if it's a surname, male or female name
                            result_gender = "male"  # Default
                            
                            if "女" in text or "妇" in text or "她" in text:
                                result_gender = "female"
                            elif "姓" in text:
                                result_gender = "surname"
                            
                            # Get pinyin if available
                            result_pinyin = ""
                            if pinyin_candidates:
                                # Filter out common non-pinyin English words
                                non_pinyin = ['div', 'span', 'class', 'the', 'and', 'for', 'name', 'search']
                                filtered_pinyin = [p for p in pinyin_candidates if p.lower() not in non_pinyin and len(p) > 1]
                                if filtered_pinyin:
                                    result_pinyin = filtered_pinyin[0]
                            
                            # Add each Chinese character as a name entry
                            for char in chinese_chars:
                                # Exclude very long strings that are likely paragraphs, not names
                                if len(char) <= 2:
                                    name_entry = {
                                        "name": char,
                                        "culture": "chinese",
                                        "gender": result_gender,
                                        "pinyin": result_pinyin
                                    }
                                    all_names.append(name_entry)
                
                # Sleep to avoid rate limiting
                time.sleep(random.uniform(1, 3))
                
            except Exception as e:
                print(f"Error processing search term {search_term}: {str(e)}")
    except Exception as e:
        print(f"Error with search functionality: {str(e)}")
    
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
        # Try to get names from Chinese Name Network
        names = extract_names_from_chinese_name_network()
        
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