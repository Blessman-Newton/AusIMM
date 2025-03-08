import streamlit as st
import joblib
import numpy as np
import pandas as pd

# Load the trained model, scaler, and label encoder
model = joblib.load('stacked_model.pkl')
scaler = joblib.load('scaler.pkl')
label_encoder = joblib.load('label_encoder.pkl')

# Function to make predictions
def predict_stability(hr, n):
    input_data = np.array([[hr, n]])
    
    # Scale the input data
    input_scaled = scaler.transform(input_data)
    
    # Make prediction
    prediction = model.predict(input_scaled)
    
    # Decode the prediction to original label
    status = label_encoder.inverse_transform(prediction)[0]
    return status

# Streamlit App Design
st.title("Stope Stability Prediction")
st.write("Enter the parameters to predict stope stability.")

# Input widgets
#q = st.number_input("q (Stability Factor)", min_value=0.0, step=0.1)
#a = st.number_input("a (Geometric Factor)", min_value=0.0, step=0.1)
#b = st.number_input("b (Rock Strength)", min_value=0.0, step=0.1)
#c = st.number_input("c (Support Strength)", min_value=0.0, step=0.1)
hr = st.number_input("HR (Hydraulic Radius)", min_value=0.0, step=0.1)
n = st.number_input("Stability number", min_value=0.0, step=1.0)

# Predict on button click
if st.button("Predict Stability"):
    if any([hr, n]):
        prediction = predict_stability(hr, n)
        st.success(f"Predicted Status: **{prediction}**")
    else:
        st.warning("Please enter all required parameters.")

# Add some styling
st.markdown(
    """
    <style>
    .stButton > button {
        background-color: #4CAF50;
        color: white;
    }
    </style>
    """,
    unsafe_allow_html=True
)