import json

def generate_ts_file():
    try:
        with open('vocab_dump.json', 'r', encoding='utf-8') as f:
            vocab_data = json.load(f)
        
        ts_content = """export interface Vocabulary {
  id: number;
  word: string;
  translation: string;
  partOfSpeech?: string;
  example?: string;
}

export const vocabularyList: Vocabulary[] = [
"""
        
        for i, item in enumerate(vocab_data, 1):
            word = item['word'].replace("'", "\\'")
            translation = item['definition'].replace("'", "\\'")
            example = item['example'].replace("'", "\\'")
            
            ts_content += f"""  {{
    id: {i},
    word: '{word}',
    translation: '{translation}',
    example: '{example}',
  }},
"""
        
        ts_content += "];\n"
        
        with open('app/data/vocabulary.ts', 'w', encoding='utf-8') as f:
            f.write(ts_content)
            
        print(f"Successfully generated app/data/vocabulary.ts with {len(vocab_data)} entries.")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    generate_ts_file()
