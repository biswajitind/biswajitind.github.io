---
layout: post
title:  "AirScript - Creating Documents in Air"
desc: "AirScript is a novel approach for creating documents in air."
keywords: "publication,handwriting recognition in air,deep learning"
date: 29-07-2017
categories: [publications]
tags: [handwriting recognition in air, deep learning, classifier fusion, GRU, CNN]
icon: fa-file-text-o
---

### **Status**: Accepted for an oral presentation [ICDAR2017](http://u-pat.org/ICDAR2017/)
### **Link to the Paper**: [https://arxiv.org/abs/1705.11181](https://arxiv.org/abs/1705.11181)
<br>
# **What is AirScript**

[AirScript](https://arxiv.org/abs/1705.11181) is a novel approach for creating, recognizing and visualizing documents in air. We came up with a novel algorithm, called **2-DifViz**, that converts the hand movements in air (captured by a Myo-armband worn by a user) into a sequence of x, y coordinates on a 2D Cartesian plane, and visualizes them on a canvas. AirScript gives freedom of movement to the user, as well as provides a real-time visual feedback of the written characters, making the interaction natural. AirScript provides a recognition module to predict the content of the document created in air. This recognition modules is based on **deep learning**, which uses the sensor data and the visualizations created by 2-DifViz. The recognition module consists of a Convolutional Neural Network (CNN) and two Gated Recurrent Unit (GRU) Networks. The output from these three networks is fused to get the final prediction about the characters written in air. Well, if that did not make it clear then watch this video that demonstrates what AirScript is and what it does.

<div class="text-center">
    <iframe width="60%" height="315" src="https://www.youtube.com/embed/olrJhrLXDAk" frameborder="0" allowfullscreen></iframe>    
</div>
<br>

# **How did the idea emerge?**

The original idea was to develop *Sign Language to Speech* application as apart of a lab called **SoftwareLabor** at the University of Kaiserslautern. We discussed with our mentors and realised that we can come up with a generic model that can help us model hand signals/movements. After a few days of brainstorming we decided to work on Handwriting Recognition in Air. We eventually moved to another lab called [MindGarage](http://mindgarage.ai/), where we finished the project.

# **The Concept**

To create documents in air we first had to tackle the problem of mapping hand movements into some representation that could be visualised in real time. This took us about two to three months to come up with a method that we call **2-DiffViz**, which converts hand movements into 2-D coordinates that can be visualised in real time. As a proof of concept, we first developed AirScript for Handwritten Digit Recognition in Air. Currently, we are developing AirScript for Unconstrained Handwriting Recognition in Air.

#  **2-DiffViz**

I originally called it **2-D Differential Visualiser** but as you can see it was not a name that people would remember or catch on to. So, I changed it to 2-DiffViz, which sounded way cooler than **2-D Differential Visualiser**.

**2-DiffViz** takes the *pitch* and *yaw* (hand movements) from the MYO-Armband and converts the angular displacements into 2D coordinates. If you wish to understand the maths behind 2-DiffViz then please refer to the [Section IV-B of the paper](https://arxiv.org/abs/1705.11181). We create a sequence of such *(x, y)* coordinates at a sampling rate of 1000Hz. These coordinates are used further in both visualising and recognising the characters written in air.

<img src="https://chalelele.files.wordpress.com/2017/07/vision.png" alt="Vision" style="width: 100%;">

#  **Realtime Visualisation**

We developed an app to visualise hand movements. It works as if there were an imaginary 2-D canvas in front of you and you were writing on it. The best part it that you have full freedom of movement. The moment you start writing, we recalibrate your reference location and the imaginary canvas moves to your new location. Well, in reality the movement is dependent on the Bluetooth range of the MYO-Armband.

# **Recognition of the Characters** 

To recognise the characters that the user is writing in air we use a fused classifier model. We used Deep Learning for developing all the recognition modules of AirScript. To make the recognition robust and cover all modality we used both spatial and temporal features from the hand movements to perform recognition. To capture the spatial features we convert the 2-DiffViz coordinate sequence into an image and train a Convolutional Neural Network to perform a classification task with digits as labels. To capture the temporal features we train two Gated Recussent Unit Networks. One was trained on the raw IMU signals and the other was trained on the 2-DiffViz coordinate sequence. The result of the three networks is fused using a very simple weighted average technique, in which the weights of the classifiers are their recognition rates. The following image shows the entire architecture of AirScript.

<img src="https://chalelele.files.wordpress.com/2017/07/architecture_diagram_new1.png" alt="Architecture" style="width: 100%;">

# **Applications**

We believe that AirScript can be used in highly sophisticated environments like a smart classroom, a smart factory or a smart laboratory, where it would enable people to annotate pieces of texts wherever they want without any reference surface.

# **Evaluation**

We have evaluated AirScript against various well-known learning models (HMM, KNN, SVM, etc.). Evaluation results show that the recognition module of AirScript largely outperforms all of these models by achieving an accuracy of 91.7% in a person independent evaluation and a 96.7% accuracy in a person dependent evaluation.

# **Vision**

I am currently working on extending AirScript for Unconstrained Handwriting Recognition in Air. I will be making the AirScript's source code open-source very soon. Presently the GUI of AirScript works on Ubuntu and has been developed in Python. I wish to develop a web GUI for anyone so that it is extremely portable and easy to use.
