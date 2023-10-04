import os
import sqlite3
import time
import warnings

import pandas as pd

from TextNormalization import TextNormalization

warnings.filterwarnings("ignore")


def main():
    start = time.time()

    # ###############################################################
    print(" --  -- Started: Read Input Data --  -- ")
    input_data = pd.read_csv('clusters_SBERT.csv')
    # ###############################################################

    # ###############################################################
    print(" --  -- Started: Text Normalization --  -- ")
    input_data['normalized_body'] = None
    input_data['normalized_body_tokens'] = None
    # text_normalization = TextNormalization(
    #     custom_stopwords_file="./input/custom_stopwords.csv")
    text_normalization = TextNormalization(
        custom_stopwords_file='input/custom_stopwords.csv')
    for index, row in input_data.iterrows():
        tokens = text_normalization.normalize_text(row['description'])
        text = ' '.join(tokens).strip()
        input_data.at[index, 'normalized_body'] = text
        input_data.at[index, 'normalized_body_tokens'] = tokens
    # ###############################################################

    # ###############################################################
    print(" -- -- Printing Output -- ---")
    input_data.to_csv('./clusters_cleaned_SBERTV2.csv')
    # ###############################################################


if __name__ == "__main__":
    main()
