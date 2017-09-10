---
layout: post
title:  "Pewter - Data Visualization and Analysis"
desc: "Data visualisation and analysis of raw data before starting to code. Intoduction to Pewter, an application to visualise and acquire data from Myo armband."
keywords: "sigvoiced,machine learning,intro"
date: 30-10-2016
categories: [Sigvoiced]
tags: [data-acquisition,data-preprocessing,data-visualisation,dynamic-time-warping,feature extraction,hidden markov ,LSTM,machine learning,mfcc,myo armband,pattern recognition,SVM]
icon: fa-signing
---

# What is Pewter

**Pewter **is an open-source project for **Acquisition, ****Analysis and**** Visualisation **of raw data from Myo and conduct experiments on it. I developed this application when I started working on the project **SigVoiced** for sign language to speech conversion. Feel free to contribute or make use of it if you are working on the raw data from  MYO Armband. **Github Link** : **[https://github.com/sigvoiced/pewter](https://github.com/sigvoiced/pewter)**

# Data Acquisition

Well, data acquisition is not a trivial task. A lot of things need to be taken care of and it needs to be done very carefully and precisely. So, to make sure that we are on the right track, we first acquire a small set of data that we will use for building a proof of concept and then we will plan real data acquisition accordingly. I will continue with the  '**Sign language to voice**' example that I had mentioned in my **[previous post](https://sigvoiced.wordpress.com/2016/07/02/model-evolution/)** for explaining further.

## Step 1 - Planning

1.  **Select Gestures:** For the proof of concept select a few gestures that you want to work on. In our case we took the following single handed signs in Indian Sign Language (refer to the following link for reference), whih are most commonly used.

    *  Deaf

    *  Hearing

    *  Parent

    *  Father

    *  Mother

    *  Name

    *  Bad

    *  Good

***Reference:*** [Talking Hands](http://www.talkinghands.co.in/Default)

2.  **Number of participants: **Since there were 2 people (including me) in my lab who were willing to give time for the data acquisition task, I took **10 instances per person per sign** for making a proof of concept and as mentioned in the [previous post](https://sigvoiced.wordpress.com/2016/07/02/model-evolution/), carry out **STEP-1** of the modelling process._If you are an expert then you might skip this step and plan modelling and data acquisition. But I highly recommend some analysis before jumping into generating different models and evaluating them._  

3.  **Experiment Setup and Ground Truth:** Before conducting any experiment, think about the conditions that you are going to experiment in and how you are going to use the device for experimenting. In our case, we had the following conditions,

    *   **Wear the MYO armband** and follow the instructions provided in the MYO armband manual while wearing it.

    *   **Experiment with right-handed people:** Since, we just had right handed people for data acquisition, we will stick to that for now.

    *   **Single handed Signs:** Collect data for only single handed signs as we just had one armband to work with.

    *   **Learn the Signs: **Since we were not pros in ISL so we referred to **[Talking Hands](http://www.talkinghands.co.in/Default)** before collecting data.

    *   **[Ground Truth](https://en.wikipedia.org/wiki/Ground_truth)**: Data for four signs, Deaf, Hearing, Parent, Father, Mother, Name, Bad, Good in ISL

4.  **Data Analysis: **We planned to analyse two things,

    1.  **Universal model:** Whether there is any significant difference in the signal data of two different participants for the same sign? If there is then which sensors are significant differentiating data?

    2.  **Personal Model:** Whether there is consistency in the data from a single person for the same sign? Does the data from a single person seem to be differentiating different signs?

## Step-2 Data Acquisition

1.  **We collected 10 instances per sign per person** using **[Pewter](https://github.com/sigvoiced/pewter)** for analysis. Please find the data **[here](https://drive.google.com/folderview?id=0B39jMq4OCmFDZ2FMTHNXd3VRckk&usp=sharing)**. The data is in JSON format and the schema can be found in Pewter's readme file.

2.  **Documentation: **We documented some metadata for reference about the participants like name, age, gender etcetera.

*We asked the participants whether we can share their data publically and they were absolutely ok with it.*

## Step-3 Visualization

We used the visualisation module of Pewter for analysing our data

1.  **Personal Model: **We observed the following,
    *   IMU (Inertial Measurement Unit) signals had less variation for signs with fewer hand movement. This was quite obvious but now it was evident too.
.
    *   All EMG pods did not have differentiating data. But, signs with finger movements had highly variant signals.

    *   There was a little noise in the signals.

    *   We could see some observable patterns in the data, giving us an idea for feature selection.

2.  **Universal Model:** We observed the following,

    *   The observations were similar as above but the data had shifted for the IMU sensors.

## Step-4 Preprocessing analysis

1.  **Noise Removal:** We decided not to go for noise removal as no matter how hard we try, we will not be able to get rid of all the noise.

2.  **Resampling: **Because of different sampling rates for EMG and IMU sensors, we decided to resample the data and normalise it.

3.  **Scaling:** We planned to use an **[absolute scaler](http://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.MaxAbsScaler.html)** for scaling the data to range from **[0,1].**

## Step-5 Deciding Algorithms

Since we want to classify time series data, the best approach would be to use **[Hidden Markov Models](https://en.wikipedia.org/wiki/Hidden_Markov_model)** which are quite popular. Another model that is quite well known is **[Recurrent Neural Networks](http://karpathy.github.io/2015/05/21/rnn-effectiveness/)** (in this case** [LSTM](http://colah.github.io/posts/2015-08-Understanding-LSTMs/)**s) with **[Connectionist Temporal Classification](ftp://ftp.idsia.ch/pub/juergen/icml2006.pdf)**. These are state of the art classifiers for classifying time series data. With these we would also evaluate a few other models too to do a fair compairision.

1.  **[Hidden Markov Model](https://en.wikipedia.org/wiki/Hidden_Markov_model) **: With raw data

2.  **Hidden Markov Model:** With features from sliding windows

3.  **[Support Vector Machine](https://en.wikipedia.org/wiki/Support_vector_machine):** With global features

4.  **[K-Nearest Neighbors](https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm) With [Dynamic Time Warping](https://en.wikipedia.org/wiki/Dynamic_time_warping)**: With signal templates

5.  **[Naive Bayes](https://en.wikipedia.org/wiki/Naive_Bayes_classifier):** With global Features

6.  **[Recurrent Neural Networks](http://karpathy.github.io/2015/05/21/rnn-effectiveness/) (Long Short Term Memory - LSTM with [Connectionist Temporal Classification](ftp://ftp.idsia.ch/pub/juergen/icml2006.pdf)):** With raw data

## Step-6 Features

The following are the features that we plan to extract from the processed signals.

1.  **Time domain**

    1.  Mean
    2.  Variance
    3.  Sum of Squares
    4.  Zero Crossings
    5.  Gradient Changes
    6.  1st Order Derivative (of raw signal)
    7.  2nd Order Derivative (of raw signal)
    8.  Root Mean Square
    9.  Peaks
    10.  Maxima
    11.  Minima

2.  **Frequency Domain**

    1.  Mean Power
    2.  1st Dominant Frequency
    3.  2nd Dominant Frequency
    4.  Number of peaks
    5.  Variance
    6.  Total Power
    7.  Maxima
    8.  Minima

3.  **[MFCC](https://en.wikipedia.org/wiki/Mel-frequency_cepstrum) (Mel-frequency cepstral coefficients)**: These have been widely used in audio and speech analysis. We thought of experimenting with MFCCs as features as well.

We would analyse the features and remove insignificant features by visualising the features as **[parallel coordinates](https://en.wikipedia.org/wiki/Parallel_coordinates)**.

# What Next?

In my next series of post I will cover the following,

1.  **Data Preprocessing**

2.  **Feature Extraction**

3.  **Model Evaluation for all the methods mentioned above**

I will provide all the data and scripts required for everything that I will do. If you know the concepts that I have mentioned above then well an good otherwise you can go through the references that I have provided for further knowledge on the mentioned topics.

# References

1.  **Hidden Markov Model:** [http://www.ece.ucsb.edu/Faculty/Rabiner/ece259/Reprints/tutorial%20on%20hmm%20and%20applications.pdf](http://www.ece.ucsb.edu/Faculty/Rabiner/ece259/Reprints/tutorial%20on%20hmm%20and%20applications.pdf)

2.  **LSTM:** [http://colah.github.io/posts/2015-08-Understanding-LSTMs/](http://colah.github.io/posts/2015-08-Understanding-LSTMs/)

3.  **Recurrent Neural Networks**: [https://en.wikipedia.org/wiki/Recurrent_neural_network](https://en.wikipedia.org/wiki/Recurrent_neural_network)

4.  **Connectionist Temporal Classification: **[ftp://ftp.idsia.ch/pub/juergen/icml2006.pdf](ftp://ftp.idsia.ch/pub/juergen/icml2006.pdf)

5.  **Dynamic time warping: **[https://en.wikipedia.org/wiki/Dynamic_time_warping](https://en.wikipedia.org/wiki/Dynamic_time_warping)

6.  **K-Nearest Neighbor**: [https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm](https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm)

7.  **Dynamic Time Warping: **[https://en.wikipedia.org/wiki/Dynamic_time_warping](https://en.wikipedia.org/wiki/Dynamic_time_warping)

8.  **Naive Bayes Classifier: **[https://en.wikipedia.org/wiki/Naive_Bayes_classifier](https://en.wikipedia.org/wiki/Naive_Bayes_classifier)

9.  **Mel-frequency cepstrum: **[https://en.wikipedia.org/wiki/Mel-frequency_cepstrum](https://en.wikipedia.org/wiki/Mel-frequency_cepstrum)

10.  **Parallel Coordinates: **[https://en.wikipedia.org/wiki/Parallel_coordinates](https://en.wikipedia.org/wiki/Parallel_coordinates)