import pandas as pd
import glob
import os

dataset_dir = "d:/Citil hack/dataset"
excel_files = glob.glob(os.path.join(dataset_dir, "*.xlsx"))

for file in excel_files:
    try:
        df = pd.read_excel(file, nrows=0)
        print(f"\n--- {os.path.basename(file)} ---")
        print(df.columns.tolist())
    except Exception as e:
        print(f"Error reading {file}: {e}")
