import glob
import re
import string
from os import path

import contractions
import nltk
import pandas as pd
from nltk import PorterStemmer
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize
import nltkmodules
from bs4 import BeautifulSoup


class TextNormalization:

    def __init__(self, custom_stopwords_file=None, programming_languages=None):
        nltkmodules.download_nltk_modules()
        self.programming_languages = programming_languages
        self.custom_stopwords_file = custom_stopwords_file
        self.stopwords = self.__get_stopword_list()

    def __get_stopword_list(self, ):
        # nltk stopwords
        stop_words = stopwords.words('english')

        # custom stopwords
        if self.custom_stopwords_file is not None:
            if path.exists(self.custom_stopwords_file):
                stopwords_custom = pd.read_csv(self.custom_stopwords_file)
                stop_words.extend(stopwords_custom['word'].values)

        stop_words_unique = set()
        [x for x in stop_words if x.lower(
        ) not in stop_words_unique and not stop_words_unique.add(x.lower())]

        return stop_words_unique

    def normalize_text(self, text, programming_language=None):
        # remove whitespaces from start and end of text
        text = text.strip()

        # expand contractions
        text = contractions.fix(text)

        # # remove code blocks
        # text = self.__remove_code_tags(text)

        # remove urls
        text = re.sub(
            r'\w+:/{2}[\d\w-]+(\.[\d\w-]+)*(?:(?:\/[^\s/]*))*', '', text)

        # remove html tags
        text = re.sub(r'<[^>]+>', '', text)

        # # remove alphanumeric words
        # text = re.sub(r'\w*\d\w*', '', text)

        # # remove words containing an underscore character
        # text = re.sub(r'\w*_\w*', '', text)

        # # remove words containing a ` character
        # text = re.sub(r'\w*`\w*', '', text)

        # # remove words containing a = character
        # text = re.sub(r'\w*=\w*', '', text)

        # # remove words containing a / character
        # text = re.sub(r'\w*/\w*', '', text)

        # # remove words containing a \ character
        # text = re.sub(r'\w*\\\w*', '', text)

        # # remove words containing a % character
        # text = re.sub(r'\w*%\w*', '', text)

        # # remove words containing a # character
        # text = re.sub(r'\w*#\w*', '', text)

        # # remove words containing a ( character
        # text = re.sub(r'\w*\(\w*', '', text)

        # # remove words containing a ) character
        # text = re.sub(r'\w*\)\w*', '', text)

        # # remove words containing a ] character
        # text = re.sub(r'\w*\]\w*', '', text)

        # # remove words containing a [ character
        # text = re.sub(r'\w*\[\w*', '', text)

        # # remove words containing a ' character
        # text = re.sub(r'\w*\'\w*', '', text)

        # # remove words containing a + character
        # text = re.sub(r'\w*\+\w*', '', text)

        # # remove words containing a - character
        # text = re.sub(r'\w*\-\w*', '', text)

        # remove numbers
        text = re.sub(r'\d+', '', text)

        # # remove words containing special characters
        # text = re.sub(r'\w*[!@#$%^&*(),.?":{}|<>\/-]\w*', '', text)

        # remove special characters
        text = re.sub(r'/[.,\/#!$%\^&\*;:{}=\-_`~()]/g', '', text)
        text = re.sub(r'[!@#$%^&*(),.?":{}|<>-]', '', text)
        text = re.sub(r'[^a-zA-Z\d\s:]', '', text)

        # tokenize word
        tokens_text = word_tokenize(text)

        # remove single characters
        tokens_text = [i for i in tokens_text if not 1 == len(i)]

        # convert to lowercase
        tokens_text = [str.lower(x) for x in tokens_text]
        # text = text.lower()

        # remove stopwords
        tokens_text = [i for i in tokens_text if not i in self.stopwords]

        # remove punctuations
        tokens_text = [i for i in tokens_text if not i in string.punctuation]

        # reduce each word to its lemma
        # wordnet_lemmatizer = WordNetLemmatizer()
        # tokens_text = [wordnet_lemmatizer.lemmatize(x) for x in tokens_text]

        # reduce each word to its stem
        # porter_Stemmer = PorterStemmer()
        # lancasterStemmer = LancasterStemmer()
        # tokens_text = [lancasterStemmer.stem(x) for x in tokens_text]
        # tokens_text = [porter_Stemmer.stem(x) for x in tokens_text]

        # retain  nouns, verbs, adjectives, and adverbs
        # pos_retain=['NN','NNS','VB','VBD','VBG','VBN','VBP','VBZ','JJ','JJR','JJS','RB','RBR','RBS']
        # tokens_text = [i for i in tokens_text if self.__get_part_of_speech(i) in pos_retain]

        # # remove non-dictionary words
        # tokens_text = [i for i in tokens_text if len(wordnet.synsets(i))!=0]

        # # remove named entities: convert words to Title Case, remove any matches, convert sentence to words
        # self.nlp = spacy.load("en_core_web_sm")
        # sent = self.__regenerate_sentence(tokens_text)
        # doc = nlp(titlecase(sent))
        # for i in doc.ents:
        #     sent = sent.replace(i.lower_,'')
        # tokens_text = word_tokenize(sent.lower())

        return tokens_text

    # Function to remove tags
    @staticmethod
    def __remove_code_tags(html):
        # parse html content
        soup = BeautifulSoup(html, "html.parser")

        for data in soup(['code']):
            # Remove tags
            data.decompose()

    # return data by retrieving the tag content
        return ' '.join(soup.stripped_strings)

    @staticmethod
    def __get_part_of_speech(term):
        if term == "":
            return ""
        temp = nltk.pos_tag([term.lower()])
        if len(temp) >= 1:
            return temp[0][1]

        return ""

    @staticmethod
    def __regenerate_sentence(tokens):
        text = ""
        for i in tokens:
            text += i
            text += " "

        return text.strip()
