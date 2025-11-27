import json
import os
import re

def parse_vocabulary():
    # Use the local file we just created
    file_path = os.path.join(os.path.dirname(__file__), 'reference_local.md')
    
    print(f"Looking for file at: {os.path.abspath(file_path)}")
    
    if not os.path.exists(file_path):
        print(f"Error: File not found at {os.path.abspath(file_path)}")
        return

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            print(f"Read {len(lines)} lines from file")
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    vocabulary = []
    
    for line_num, line in enumerate(lines):
        if not line.strip():
            continue
            
        # Split by tab
        parts = [p.strip() for p in line.split('\t') if p.strip()]
        
        # Skip header lines or empty lines
        if not parts or parts[0] == 'EN':
            continue
            
        # Process pairs (EN, IDN)
        # The file format is EN \t IDN \t EN \t IDN ...
        # So we iterate by 2
        for i in range(0, len(parts), 2):
            if i + 1 < len(parts):
                word = parts[i]
                definition = parts[i+1]
                
                # Basic validation
                if word and definition and word != 'EN':
                    vocabulary.append({
                        "word": word.title(), # Convert to Title Case
                        "definition": definition,
                        "example": f"Example sentence for {word.title()}" # Placeholder
                    })

    print(f"Successfully processed {len(vocabulary)} words")
    
    # Sort alphabetically
    vocabulary.sort(key=lambda x: x['word'])
    
    # Remove duplicates
    unique_vocab = []
    seen_words = set()
    for item in vocabulary:
        if item['word'] not in seen_words:
            unique_vocab.append(item)
            seen_words.add(item['word'])
            
    print(f"Unique words: {len(unique_vocab)}")
    
    # Save to JSON
    output_path = os.path.join(os.path.dirname(__file__), 'vocab_dump.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(unique_vocab, f, indent=2, ensure_ascii=False)
        
    print(f"Saved vocabulary to {output_path}")

if __name__ == "__main__":
    parse_vocabulary()
