---
layout: post
title:  "A Hands-on Tutorial on Neural Language Models"
desc: "This is a hands-on tutorial on Neural Language Models"
keywords: "LSTM, Neural Language Models, RNN, language-models"
date: 19-08-2017
categories: [tutorials]
tags: [generative models, Language Models, LSTM]
icon: fa-file-text-o
---

# **1. Introduction**
If you are here that means you wish to cut the crap and understand how to train your own Neural Language Model. If you are a regular user of frameworks like Keras, Tflearn, etc., then you know how easy it has become these days to build, train and deploy Neural Network Models. If not then you will probably by the end of this post. Clone [this repository](https://github.com/dashayushman/neural-language-model) (refer to Section 5 for details) to get the Jupyter Notebook and run it on your computer.  

<br>
# **2. Prerequisite**
1. [**Python**](https://www.tutorialspoint.com/python/): I will be using Python 3.5 for this tutorial

2. [**LSTM**](http://colah.github.io/posts/2015-08-Understanding-LSTMs/): If you don't know what LSTMs are, then this is a must read.

3. [**Basics of Machine Learning**](https://www.youtube.com/watch?v=2uiulzZxmGg): If you want to dive into Machine Learning/Deep Learning, then I strongly recommend the first 4 lectures from [Stanford's CS231]() by Andrej Karpathy.

4. [**Language Model**](https://en.wikipedia.org/wiki/Language_model): If you want to have a basic understanding of Language Models.

<br>
# **3. Frameworks**

1. [Tflearn](http://tflearn.org/installation/) 0.3.2
2. [Spacy](https://spacy.io/) 1.9.0
3. [Tensorflow](https://spacy.io/) 1.0.1

**Note**: You can take this post as a hands-on exercise on "How to build your own Neural Language Model" from scratch. If you have a ready to use virtualenv with all the dependencies installed then you can skip Section 4 and jump to Section 5. 

<br>
# **4. Install Dependencies**
We will install everything in a virtual environment and I would suggest you run this Jupyter Notebook in the same virtualenv. I have also provided a ```requirements.txt``` file with the [repository](https://github.com/dashayushman/neural-language-model) to make things easier.

### **4.1 Virtual Environment**

You can follow [this](http://docs.python-guide.org/en/latest/dev/virtualenvs/) for a fast guide to Virtual Environments.

```sh
pip install virtualenv
```

### **4.2 Tflearn**
Follow [this](http://tflearn.org/installation/) and install Tflearn. Make sure to have the versions correct in case you want to avoid weird errors. 

```sh
pip install -Iv tflearn==0.3.2
```

### **4.3 Tensorflow**
Install Tensorflow by following the instructions [here](https://www.tensorflow.org/install/). To make sure of installing the right version, use this

```sh
pip install -Iv tensorflow-gpu==1.0.1
```
Note that this is the GPU version of Tensorflow. You can even install the CPU version for this tutorial, but I would strongly recommend the GPU version if you intend to intend to scale it to use in the real world.

### **4.4 Spacy**
Install Spacy by following the instructions [here](https://spacy.io/docs/usage/). For the right version use,

```sh
pip install -Iv spacy==1.9.0
python -m spacy download en_core_web_sm
```

### **4.5 Others**
```sh
pip install numpy
```

<br>
# **5. Clone the Repo**
clone the Neural Language Model GitHub repository onto your computer and start the Jupyter Notebook server.

```sh
git clone https://github.com/dashayushman/neural-language-model.git
cd neural-language-model
jupyter notebook
```

Open the notebook names **Neural Language Model** and you can start off.

<br>
# **6. Neural Language Model**
We will start building our own Language model using an LSTM Network. To do so we will need a corpus. For the purpose of this tutorial, let us use a toy corpus, which is a text file called ```corpus.txt``` that I downloaded from Wikipedia. I will use this to demonstrate how to build your own Neural Language Model, and you can use the same knowledge to extend the model further for a more realistic scenario (I will give pointers to do so too).

## **6.1 Loading The Corpus**
In this section, you will load the ```corpus.txt``` and do minimal preprocessing.


```python
import re

with open('corpus.txt', 'r') as cf:
    corpus = []
    for line in cf: # loops over all the lines in the corpus
        line = line.strip() # strips off \n \r from the ends 
        if line: # Take only non empty lines
            line = re.sub(r'\([^)]*\)', '', line) # Regular Expression to remove text in between brackets
            line = re.sub(' +',' ', line) # Removes consecutive spaces
            # add more pre-processing steps
            corpus.append(line)
print("\n".join(corpus[:5])) # Shows the first 5 lines of the corpus
```

    Deep learning is part of a broader family of machine learning methods based on learning data representations, as opposed to task-specific algorithms. Learning can be supervised, partially supervised or unsupervised.
    Some representations are loosely based on interpretation of information processing and communication patterns in a biological nervous system, such as neural coding that attempts to define a relationship between various stimuli and associated neuronal responses in the brain. Research attempts to create efficient systems to learn these representations from large-scale, unlabeled data sets.
    Deep learning architectures such as deep neural networks, deep belief networks and recurrent neural networks have been applied to fields including computer vision, speech recognition, natural language processing, audio recognition, social network filtering, machine translation and bioinformatics where they produced results comparable to and in some cases superior to human experts.
    Deep learning is a class of machine learning algorithms that:
    use a cascade of many layers of nonlinear processing units for feature extraction and transformation. Each successive layer uses the output from the previous layer as input. The algorithms may be supervised or unsupervised and applications include pattern analysis and classification.


As you can see that this small piece of code loads the toy text corpus, extracts lines from it ignore empty lines and remove text in between brackets. Note that in reality, you will not be able to load the entire corpus into memory. You will need to write a [generator](https://wiki.python.org/moin/Generators) to yield text lines from the corpus, or use some advanced features provided by the Deep Learning frameworks like [Tensorflow's Input Pipelines](https://www.tensorflow.org/programmers_guide/reading_data). 

## **6.2 Tokenizing the Corpus**
In this section, we will see how to tokenize the text lines that we extracted and then create a **Vocabulary**.


```python
# Load Spacy
import spacy
import numpy as np
nlp = spacy.load('en_core_web_sm')
```


```python
def preprocess_corpus(corpus):
    corpus_tokens = []
    sentence_lengths = []
    for line in corpus:
        doc = nlp(line) # Parse each line in the corpus
        for sent in doc.sents: # Loop over all the sentences in the line
            corpus_tokens.append('SEQUENCE_BEGIN')
            s_len = 1
            for tok in sent: # Loop over all the words in a sentence
                if tok.text.strip() != '' and tok.ent_type_ != '': # If the token is a Named Entity then do not lowercase it 
                    corpus_tokens.append(tok.text)
                else:
                    corpus_tokens.append(tok.text.lower())
                s_len += 1
            corpus_tokens.append('SEQUENCE_END')
            sentence_lengths.append(s_len+1)
    return corpus_tokens, sentence_lengths

corpus_tokens, sentence_lengths = preprocess_corpus(corpus)
print(corpus_tokens[:30]) # Prints the first 30 tokens
mean_sentence_length = np.mean(sentence_lengths)
deviation_sentence_length = np.std(sentence_lengths)
max_sentence_length = np.max(sentence_lengths)
print('Mean Sentence Length: {}\nSentence Length Standard Deviation: {}\n'
      'Max Sentence Length: {}'.format(mean_sentence_length, deviation_sentence_length, max_sentence_length))
```

    ['SEQUENCE_BEGIN', 'deep', 'learning', 'is', 'part', 'of', 'a', 'broader', 'family', 'of', 'machine', 'learning', 'methods', 'based', 'on', 'learning', 'data', 'representations', ',', 'as', 'opposed', 'to', 'task', '-', 'specific', 'algorithms', '.', 'SEQUENCE_END', 'SEQUENCE_BEGIN', 'learning']
    Mean Sentence Length: 27.107142857142858
    Sentence Length Standard Deviation: 16.244426045601625
    Max Sentence Length: 65


**Notice** that we did not lowercase the [Named Entities(NEs)](https://en.wikipedia.org/wiki/Named-entity_recognition). This is totally your choice. Its part of a normalization step and I believe it is a good idea to let the model learn the Named Entities in the corpus. But do not blindly consider any library for NEs. I chose Spacy as it is very simple to use, fast and efficient. Note that I am using the [**en_core_web_sm**](https://spacy.io/docs/usage/models) model of Spacy, which is very small and good enough for this tutorial. You would probably want to choose your own NE recognizer.

Other Normalization steps include [stemming and lemmatization](https://nlp.stanford.edu/IR-book/html/htmledition/stemming-and-lemmatization-1.html) which I will not implement because **(1)** I want my Language Model to learn the various forms of a word and their occurrences by itself; **(2)** In a real world scenario you will train your Model with a huge corpus with Millions of text lines, and you can assume that the corpus covers the most commonly used terms in Language. Hence, no extra normalization is required. 

### **6.2.1 SEQUENCE_BEGIN and SEQUENCE_END**
Along with the naturally occurring terms in the corpus, we will add two new terms called the *SEQUENCE_BEGIN* and **SEQUENCE_END** term. These terms mark the beginning and end of a sentence. We do this because we want our model to learn word occurring at the beginning and at the end of sentences. Note that we are dependent on Spacy's Tokenization algorithm here. You are free to explore other tokenizers and use whichever you find is best.

## **6.3 Create a Vocabulary**
After we have minimally preprocessed the corpus and extracted sequence of terms from it, we will create a vocabulary for our Language Model. This means that we will create two Python dictionaries,
1. **Word2Idx**: This dictionary has all the unique words(terms) as keys with a corresponding unique ID as values
2. **Idx2Word**: This is the reverse of Word2Idx. It has the unique IDs as keys and their corresponding words(terms) as values


```python
vocab = list(set(corpus_tokens)) # This works well for a very small corpus
print(vocab)
```

    ['today', 'generative', 'stimuli', 'loosely', 'natural', 'at', 'level', 'opposed', 'experts', 'be', 'broader', 'comparable', 'propositional', 'also', 'language', 'wealth', 'such', 'responses', 'methods', 'continued', 'Colorado', 'correspond', 'leading', 'CAP', 'part', 'finance', 'valid', 'competed', 'in', 'or', 'composition', 'discoveries', 'recurrent', 'patterns', 'algorithms', 'biological', 'neural', 'some', 'networks', 'network', 'cascade', 'many', 'analysis', 'agree', 'Drinker', ':', 'theft', 'family', 'filtering', 'hidden', 'Othniel', 'massive', 'Bone', 'are', 'efficient', 'these', 'Cope', 'remain', 'America', 'may', 'depends', 'levels', ']', 'solved', 'system', 'sought', 'high', '-', 'divides', 'disgrace', 'once', 'assignment', 'excavation', 'that', 'Academy', 'dinosaurs', 'low', 'rich', 'descriptions', 'results', 'human', 'threshold', 'computer', 'previous', 'than', 'has', 'Deep', 'history', 'using', 'light', 'resorting', 'include', 'SEQUENCE_BEGIN', 'mainly', 'bones', 'applied', 'Belief', 'processing', 'no', 'dinosaur', 'define', 'prehistoric', 'destruction', 'been', 'recognition', 'Marsh', 'speech', 'attempts', 'coding', 'each', 'depth', 'derived', 'ruined', 'potentially', 'representations', 'Wars', 'superior', 'features.[8', 'abstraction', 'information', 'brain', 'researchers', 'used', 'but', 'describe', 'complicated', 'own', 'paleontologists', 'species', 'systems', 'hierarchy', 'shed', 'research', 'caps', 'class', 'form', 'translation', 'Museum', 'pattern', 'path', 'Edward', 'transformations', 'socially', 'The', 'other', 'create', 'features', 'lower', 'fossils', 'concepts', 'neuronal', 'deaths', 'life', 'influence', 'fields', 'layers', 'different', 'audio', 'scientific', 'procure', 'layer', 'is', 'algorithm', 'applications', 'Machines', 'plus', 'upon', 'latent', 'representation', 'connections', '1892', 'contributions', 'science', 'through', 'definitions', 'hunters', 'organized', 'shallow', 'transformation', 'data', 'partially', 'wise', 'number', 'feedforward', 'bone', 'variables', 'Philadelphia', 'age', 'they', 'to', 'nodes', 'belief', 'universally', 'including', 'by', 'wars', 'of', 'where', 'unsupervised', 'architectures', 'Networks', '/', 'fossil', 'American', ',', 'and', 'artificial', 'more', 'boxes', 'interest', 'propagate', 'follow', 'Yale', 'have', 'problem', 'efforts', 'Sciences', 'new', 'task', 'bribery', 'beds', 'associated', 'for', 'hierarchical', 'were', 'sparked', 'scale', 'cases', 'paleontology', 'the', 'Wyoming', 'interpretation', 'classification', 'multiple', 'an', 'higher', 'forming', 'agreed', 'surge', 'nervous', 'chain', 'Peabody', 'Charles', 'causal', '32', '.', 'deep', 'vision', 'services', 'unlimited', 'unlabeled', 'formulas.[9', 'bioinformatics', 'uses', 'successive', 'one', 'on', 'produced', 'cap', 'specific', 'rivalries', 'sets', 'as', 'financially', 'feature', 'large', 'a', 'most', 'from', 'during', 'History', 'based', 'underhanded', 'Nebraska', 'expeditions', 'with', 'relationship', 'Boltzmann', 'credit', 'communication', '–', 'found', 'North', 'learning', ';', 'led', 'SEQUENCE_END', 'between', 'after', 'models', 'machine', 'extraction', 'unopened', "'s", 'learn', 'input', 'decades', 'their', 'social', '1877', 'Natural', 'various', 'common', 'gilded', 'mutual', 'publications', 'public', 'can', 'supervised', 'field', 'use', 'output', 'nonlinear', 'signal', 'attacks', 'which', 'units']


**Alternatively**, if your corpus is huge, you would probably want to iterate through it entirely and generate term frequencies. Once you have the term frequencies, it is better to select the most commonly occurring terms in the vocabulary (as it covers most of the Natural Language).


```python
import collections

word_counter = collections.Counter()
for term in corpus_tokens:
    word_counter.update({term: 1})
vocab = word_counter.most_common(200) # 200 Most common terms
print('Vocab Size: {}'.format(len(vocab))) 
print(word_counter.most_common(100)) # just to show the top 100 terms
```

    Vocab Size: 200
    [('of', 36), (',', 34), ('SEQUENCE_BEGIN', 28), ('SEQUENCE_END', 28), ('the', 25), ('.', 25), ('and', 23), ('to', 22), ('in', 18), ('learning', 16), ('a', 15), ('deep', 11), ('from', 8), ('representations', 7), ('layers', 7), ('that', 6), ('layer', 6), ('their', 6), ('neural', 6), ('-', 5), ('processing', 5), ('as', 5), ('on', 5), ('level', 4), ('or', 4), ('networks', 4), ('are', 4), ('levels', 4), ('depth', 4), ('data', 4), ('is', 4), ('they', 4), ('machine', 4), ('multiple', 4), ('supervised', 4), ('nonlinear', 4), ('be', 3), ('such', 3), ('algorithms', 3), ('Cope', 3), ('may', 3), ('include', 3), ('Marsh', 3), ('attempts', 3), ('network', 3), ('each', 3), ('but', 3), ('used', 3), ('many', 3), ('features', 3), ('unsupervised', 3), ('fossil', 3), ('have', 3), ('for', 3), ('were', 3), ('based', 3), ('–', 3), ('between', 3), ('input', 3), ('field', 3), ('output', 3), ('units', 3), ('broader', 2), ('methods', 2), ('part', 2), ('recurrent', 2), ('some', 2), ('hidden', 2), ('these', 2), (']', 2), ('Deep', 2), ('dinosaur', 2), ('been', 2), ('recognition', 2), ('potentially', 2), ('shallow', 2), ('hierarchy', 2), ('fossils', 2), ('caps', 2), ('form', 2), ('including', 2), ('sets', 2), ('feature', 2), ('bones', 2), ('led', 2), ('bone', 2), ('learn', 2), ('Natural', 2), ('which', 2), ('generative', 1), ('America', 1), ('stimuli', 1), ('boxes', 1), ('loosely', 1), ('natural', 1), ('leading', 1), ('at', 1), ('opposed', 1), ('experts', 1), ('comparable', 1)]


This way we make sure to consider the ***top K*** (in this case 100) most commonly used terms in the Language (assuming that the corpus represents the Language or domain specific language. For e.g., medical corpora, e-commerce corpora, etc.). In Neural Machine Translation Models, usually, a vocabulary size of 10,000 to 100,000 is used. But remember, it all depends on your task, corpus size, and the Language itself. 

### **6.3.1 UNKNOWN and PAD**

Along with the vocabulary terms that we generated, we need two more special terms:
1. **UNKNOWN**: This term is used for all the words that the model will observe apart from the vocabulary terms.

2. **PAD**: The pad term is used to pad the sequences to a maximum length. This is required for feeding variable length sequences into the Network (we use DynamicRnn to handle variable length sequences. So, padding makes no difference. It is just required for feeding the data to Tensorflow)

This is required as during inference time there will be many unknown words (words that the model has never seen). It is better to add an **UNKNOWN** token in the vocabulary so that the model will learn to handle terms that are unknown to the Model.


```python
vocab.append(('UNKNOWN', 1))
Idx = range(1, len(vocab)+1)
vocab = [t[0] for t in vocab]

Word2Idx = dict(zip(vocab, Idx))
Idx2Word = dict(zip(Idx, vocab))

Word2Idx['PAD'] = 0
Idx2Word[0] = 'PAD'
VOCAB_SIZE = len(Word2Idx)
print('Word2Idx Size: {}'.format(len(Word2Idx)))
print('Idx2Word Size: {}'.format(len(Idx2Word)))
print(Word2Idx)

```

    Word2Idx Size: 202
    Idx2Word Size: 202
    {'generative': 90, 'stimuli': 92, 'loosely': 94, 'natural': 95, 'at': 97, 'level': 24, 'opposed': 98, 'experts': 99, 'be': 37, 'broader': 63, 'comparable': 100, 'also': 101, 'language': 102, 'such': 38, 'may': 41, 'responses': 105, 'methods': 64, 'different': 195, 'Colorado': 106, 'correspond': 107, 'CAP': 109, 'part': 65, 'finance': 110, 'competed': 112, 'in': 9, 'or': 25, 'composition': 113, 'discoveries': 114, 'recurrent': 66, 'biological': 115, 'algorithms': 39, 'networks': 26, 'agree': 116, 'some': 67, 'analysis': 117, 'sparked': 118, 'Drinker': 119, ':': 121, 'family': 123, 'hidden': 68, 'America': 91, 'are': 27, 'these': 69, 'Cope': 40, 'depends': 103, 'levels': 28, 'from': 13, ']': 70, 'solved': 129, 'system': 130, 'disgrace': 131, 'high': 132, 'divides': 134, 'once': 133, '-': 20, 'assignment': 136, 'excavation': 137, 'that': 16, 'Academy': 138, 'low': 140, 'rich': 141, 'descriptions': 142, 'results': 143, 'threshold': 144, 'history': 145, 'computer': 146, 'propositional': 147, 'than': 148, 'Deep': 71, 'Wyoming': 149, 'resorting': 151, 'include': 42, 'SEQUENCE_BEGIN': 3, 'abstraction': 169, 'mainly': 152, 'dinosaur': 72, 'applied': 153, 'Belief': 154, 'processing': 21, 'no': 155, 'define': 157, 'prehistoric': 158, 'classification': 159, 'been': 73, 'recognition': 74, 'Marsh': 43, 'speech': 160, 'attempts': 44, 'coding': 161, 'each': 46, 'depth': 29, 'derived': 163, 'ruined': 164, 'potentially': 75, 'representations': 14, 'used': 48, 'Wars': 139, 'superior': 167, 'features.[8': 168, ',': 2, 'information': 171, 'brain': 172, 'researchers': 173, 'but': 47, 'many': 49, 'describe': 174, 'continued': 120, 'complicated': 175, 'paleontologists': 176, 'species': 177, 'systems': 178, 'hierarchy': 77, 'shed': 179, 'caps': 79, 'form': 80, 'class': 181, 'Museum': 165, 'pattern': 183, 'Edward': 108, 'number': 156, 'transformations': 185, 'human': 186, '/': 187, 'features': 50, 'lower': 188, 'fossils': 78, 'concepts': 189, 'neuronal': 190, 'life': 191, 'destruction': 192, 'leading': 96, 'layers': 15, 'using': 170, 'audio': 196, 'procure': 197, 'layer': 17, 'is': 31, 'algorithm': 199, 'research': 180, 'upon': 124, 'after': 126, 'shallow': 76, 'data': 30, 'cascade': 182, 'bone': 86, 'they': 32, 'to': 8, 'universally': 150, 'including': 81, 'of': 1, 'unsupervised': 51, 'boxes': 93, 'and': 7, 'new': 104, 'have': 53, 'Sciences': 125, 'bribery': 122, 'for': 54, 'were': 55, 'scale': 127, 'the': 5, 'multiple': 34, 'network': 45, 'agreed': 193, '32': 200, 'neural': 19, '.': 6, 'deep': 12, 'PAD': 0, 'fossil': 52, 'on': 23, 'sets': 82, 'as': 22, 'feature': 83, 'most': 135, 'a': 11, 'Nebraska': 128, 'based': 56, 'bones': 84, 'UNKNOWN': 201, 'credit': 162, 'North': 166, '–': 57, 'fields': 194, 'learning': 10, 'led': 85, 'today': 198, 'SEQUENCE_END': 4, 'between': 58, 'machine': 33, 'path': 184, 'learn': 87, 'input': 59, 'their': 18, 'Natural': 88, 'supervised': 35, 'field': 60, 'output': 61, 'attacks': 111, 'nonlinear': 36, 'which': 89, 'units': 62}


## **6.4 Preload Word Vectors**

Since you are here, I am almost sure that you are familiar with or have at least heard of [Word2Vec](https://radimrehurek.com/gensim/models/word2vec.html). Read about it if you don't know. 

Spacy provides a set of pre-trained word vectors. We will make use of these to initialize our embedding layer (details in the following section). 


```python
w2v = np.random.rand(len(Word2Idx), 300) # We use 300 because Spacy provides us with vectors of size 300

for w_i, key in enumerate(Word2Idx):
    token = nlp(key[0])
    if token.has_vector:
        w2v[w_i:] = token.vector
EMBEDDING_SIZE = w2v.shape[-1]
print('Shape of w2v: {}'.format(w2v.shape))
print('Some Vectors')
print(w2v)
```

    Shape of w2v: (202, 300)
    Some Vectors
    [[-0.11943     1.04209995 -0.073869   ..., -0.35839    -0.15360001
       0.086508  ]
     [ 0.066489    0.45960999 -0.12104    ..., -0.40645     0.26826999
      -0.56797999]
     [ 0.066489    0.45960999 -0.12104    ..., -0.40645     0.26826999
      -0.56797999]
     ..., 
     [ 0.14757     0.051979   -0.064547   ..., -0.20344999  0.093171    0.23853   ]
     [-0.36684999  0.43977001 -0.42923999 ...,  0.11282     0.017365   -0.043473  ]
     [-0.32642001 -0.047426   -0.30886999 ...,  0.32141     0.16011     0.58876997]]


## **6.5 Splitting the Data**

We are almost there. Have patience :) We need to split the data into Training and Validation set before we proceed any further. So,


```python
train_val_split = int(len(corpus_tokens) * 0.8) # We use 80% of the data for Training and 20% for validating
train = corpus_tokens[:train_val_split]
validation = corpus_tokens[train_val_split:-1]

print('Train Size: {}\nValidation Size: {}'.format(len(train), len(validation)))
```

    Train Size: 607
    Validation Size: 151


## **6.6 Prepare The Training Data**

We will prepare the data by doing the following for both train and Validation data:

1. Convert word sequences to id sequences (which will be later used in the embedding layer)

2. Generate n-grams from the input sequences

3. Pad the generated n_grams to a max-length so that it can be fed to Tensorflow


```python
from tflearn.data_utils import to_categorical, pad_sequences
```


```python
# A method to convert a sequence of words into a sequence of IDs given a Word2Idx dictionary
def word2idseq(data, word2idx):
    id_seq = []
    for word in data:
        if word in word2idx:
            id_seq.append(word2idx[word])
        else:
            id_seq.append(word2idx['UNKNOWN'])
    return id_seq

# Thanks to http://locallyoptimal.com/blog/2013/01/20/elegant-n-gram-generation-in-python/
# This method generated n-grams
def find_ngrams(input_list, n):
    return zip(*[input_list[i:] for i in range(n)])

train_id_seqs = word2idseq(train, Word2Idx)
validation_id_seqs = word2idseq(validation, Word2Idx)

print('Sample Train IDs')
print(train_id_seqs[-10:-1])
print('Sample Validation IDs')
print(validation_id_seqs[-10:-1])
```

    Sample Train IDs
    [64, 2, 151, 8, 122, 2, 201, 2, 192]
    Sample Validation IDs
    [137, 9, 166, 91, 9, 5, 201, 8, 201]


### **6.6.1 Generating the Targets from N-Grams**

This might look a little tricky but it is not. Here we take the sequence of ids and generate n-grams. For the purpose of training, we need sequences of terms as the training examples and the next term in the sequence as the target. Not clear right? Let us look at an example. If our sequence of words were ```['hello', 'my', 'friend']```, then we extract n-grams, where n=2-3 (that means we split bigrams and trigrams from the sequence). So the sequence is split into ```['hello', 'my'], ['my', 'friend'] and ['hello', 'my', 'friend']```. Well, to train our network this is not enough, right? We need some objective/target that we can infer about. So to get a target we split the last term of the n-grams out. In the case of our example, the corresponding targets are ```['friend', 'my', 'friend']```. To show you the bigger picture, the input sequence ```['my', 'friend', 'friend']``` is split into n-grams and then split again to pop out a target term.

```python
bigram['hello', 'my'] --> input['hello'] --> target['my']
bigram['my', 'friend'] --> input['my'] --> target['friend']
trigram['hello', 'my', 'friend'] --> input['hello', 'my'] --> target['friend']
```


```python
def prepare_data(data, n_grams=5):
    X, Y = [], []
    for n in range(2, n_grams):
        if len(data) < n: continue
        grams = find_ngrams(data, n) # generates the n-grams
        splits = list(zip(*grams)) # split it
        X += list(zip(*splits[:len(splits)-1])) # from the inputs
        X = [list(x) for x in X] 
        Y += splits[-1] # form the targets
    X = pad_sequences(X, maxlen=n_grams, value=0) # pad them to a fixed length for Tensorflow
    Y_ = to_categorical(Y, VOCAB_SIZE) # convert the targets to one-hot encoding to perform Categorical Cross Entropy
    return X, Y_, Y

N_GRAMS = 5
X_train, Y_train, _ = prepare_data(train_id_seqs, N_GRAMS)
X_test, Y_test, _ = prepare_data(validation_id_seqs, N_GRAMS)
print('Shape X_TRAIN: {}\tShape Y_TRAIN: {}'.format(X_train.shape, Y_train.shape))
print('Shape X_TEST: {}\tShape Y_TEST: {}'.format(X_test.shape, Y_test.shape))
```

    Shape X_TRAIN: (1815, 5)    Shape Y_TRAIN: (1815, 202)
    Shape X_TEST: (447, 5)    Shape Y_TEST: (447, 202)


## **6.7 The Model**
We now define a Dynamic LSTM Model that will be our Language Model. Restart the kernel and run all cells if it does not work (some Tflearn bug). 


```python
# Hyperparameters
LR = 0.0001
HIDDEN_DIMS = 128
BATCH_SIZE = 32
N_EPOCHS=10
```


```python
import tensorflow as tf
import tflearn
```


```python
# Build the model
embedding_matrix = tf.constant(w2v, dtype=tf.float32)
net = tflearn.input_data([None, N_GRAMS], dtype=tf.int32, name='input')
net = tflearn.embedding(net, input_dim=VOCAB_SIZE, output_dim=EMBEDDING_SIZE,
                        weights_init=embedding_matrix, trainable=False)
net = tflearn.lstm(net, HIDDEN_DIMS, dropout=0.8, dynamic=True)
net = tflearn.fully_connected(net, VOCAB_SIZE, activation='softmax')
net = tflearn.regression(net, optimizer='adam', learning_rate=LR,
                         loss='categorical_crossentropy', name='target')
model = tflearn.DNN(net)
model.fit(X_train, Y_train, validation_set=(X_test, Y_test), show_metric=True,
          batch_size=BATCH_SIZE, n_epoch=N_EPOCHS)
```

    Training Step: 569  | total loss: [1m[32m4.32931[0m[0m | time: 1.111s
    | Adam | epoch: 010 | loss: 4.32931 - acc: 0.1309 -- iter: 1792/1815
    Training Step: 570  | total loss: [1m[32m4.30076[0m[0m | time: 2.130s
    | Adam | epoch: 010 | loss: 4.30076 - acc: 0.1366 | val_loss: 4.84585 - val_acc: 0.2416 -- iter: 1815/1815
    --


# **7. Inference**
The story does not get over after you train the model. We need to understand how to make inference using this trained model. Well honestly, this model is not even close to a good Language Model (one that represents the LangWe used just one article from Wikipedia to train this Language Model so we cannot expect it to be good. The idea was to realise the steps required actually build a Language Model from scratch. Now let us look at how to make an inference from the model that we just trained.

## **7.1 Log Probability of a Sequence**
Given a new sequence of terms, we would like to know the probability of the occurrence of this sequence in the Language. We make use of our trained model (which we assume to be a representation of the Langauge) and calculate the n-gram probabilities and aggregate them to find a final probability score.


```python
def get_sequence_prob(in_string, n, model):
    in_tokens, in_lengths = preprocess_corpus(in_string)
    in_ids = word2idseq(in_tokens, Word2Idx)
    X, Y_, Y = prepare_data(in_ids, n)
    preds = model.predict(X)
    log_prob = 0.0
    for y_i, y in enumerate(Y):
        log_prob += np.log(preds[y_i, y])

    log_prob = log_prob/len(Y)
    return log_prob

in_strings = ['hello I am science', 'blah blah blah', 'deep learning', 'answer',
              'Boltzman', 'from the previous layer as input', 'ahcblheb eDHLHW SLcA']
for in_string in in_strings:
    log_prob = get_sequence_prob(in_string, 5, model)
    print(log_prob)
```

    -2.91458590214
    -3.00449038943
    -2.92672940417
    -2.91479302943
    -2.95543223439
    -2.91841884454
    -2.92100688918


To get the probability of the sequence, we take the n-grams of the sequence and we infer the probability of the next term to occur, take its log and sum it with the log probabilities of all the other n-grams. The final score is the average over all. There can be other ways to look at it too. You can normalize by n too, where n is the number of grams you considered. 

# **7.2 Generating a Sequence**
Since we trained this Language model to predict the next term given the previous 'n' terms, we can sample sequences out of this model too. We start with a random term and feed it to the Model. The Model predicts the next term and then we concat it with our previous term and feed it again to the Model. In this way we can generate arbitarily long sequences from the Model. Let us see how this naive model generates sequences,


```python
def generate_sequences(term, word2idx, idx2word, seq_len, n_grams, model):
    if term not in word2idx:
        idseq = [[word2idx['UNKNOWN']]]
    else:
        idseq = [[word2idx[term]]]
    for i in range(seq_len-1):
        #print(idseq)
        padded_idseq = pad_sequences(idseq, maxlen=n_grams, value=0)
        next_label = model.predict_label(padded_idseq)
        #print(next_label)
        idseq[0].append(next_label[0][0])
    generated_str = []
    for id in idseq[0]:
        generated_str.append(idx2word[id])
    return ' '.join(generated_str)
    
term = 'classification'
seq = generate_sequences(term, Word2Idx, Idx2Word, 10, 5, model)
print(seq)
```

    classification UNKNOWN UNKNOWN UNKNOWN UNKNOWN UNKNOWN UNKNOWN UNKNOWN UNKNOWN UNKNOWN

