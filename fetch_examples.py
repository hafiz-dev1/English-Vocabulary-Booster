import nltk
from nltk.corpus import wordnet
import json
import time
import random

# You need to download the wordnet data once
try:
    nltk.data.find('corpora/wordnet.zip')
except LookupError:
    print("Downloading WordNet data...")
    nltk.download('wordnet')
    nltk.download('omw-1.4')

def get_example_sentence(word):
    """
    Fetches an example sentence for a given word using NLTK WordNet.
    """
    synsets = wordnet.synsets(word)
    if not synsets:
        return None
    
    # Try to find a synset with examples
    for synset in synsets:
        if synset.examples():
            return synset.examples()[0]
            
    return None

def enrich_vocabulary_with_examples(vocab_list):
    """
    Takes a list of dictionaries with 'word' key and adds/updates 'example' key.
    """
    enriched_vocab = []
    print(f"Processing {len(vocab_list)} words...")
    
    for item in vocab_list:
        word = item.get('word')
        if not word:
            continue
            
        example = get_example_sentence(word)
        
        if example:
            # Capitalize first letter and add period if missing
            example = example[0].upper() + example[1:]
            if not example.endswith('.'):
                example += '.'
            item['example'] = example
        else:
            print(f"No example found for: {word}")
            # Keep existing or set default
            if 'example' not in item:
                item['example'] = f"Example sentence for {word}."
        
        enriched_vocab.append(item)
        
    return enriched_vocab

# Example usage
if __name__ == "__main__":
    # Mock data - replace this with loading your actual JSON
    sample_vocab = [
        {"word": "abandon", "definition": "leave someone who needs or counts on you"},
        {"word": "ability", "definition": "the quality of being able to perform"},
        {"word": "able", "definition": "(usually followed by 'to') having the necessary means or skill or know-how or authority to do something"},
        {"word": "about", "definition": "imprecise but fairly close to correct"},
        {"word": "above", "definition": "at an earlier place"},
    ]
    
    print("Fetching examples...")
    enriched = enrich_vocabulary_with_examples(sample_vocab)
    
    print("\nResults:")
    print(json.dumps(enriched, indent=2))
