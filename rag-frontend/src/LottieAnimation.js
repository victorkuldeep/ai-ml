import React from "react";
import Lottie from "react-lottie";
import neuralAnimation from "./assets/neural-network.json"; // Your downloaded Lottie JSON file
import brainAnimation from "./assets/brain-animation.json"; // Your downloaded Lottie JSON file
import networkAnimation from "./assets/network-animation.json"; // Your downloaded Lottie JSON file
import roboticBrain from "./assets/Robotic-Brain.json"; // Your downloaded Lottie JSON file

// Neural Network Animation
const DefaultAIAnimation = () => {
  const options = {
    animationData: neuralAnimation, // Lottie animation data
    loop: true,
    autoplay: true, // Autoplay animation
  };

  return (
    <div className="lottie-container">
      <Lottie options={options} height="100%" width="100%" />
    </div>
  );
};

// Brain Animation
const BrainAnimation = () => {
  const options = {
    animationData: brainAnimation, // Lottie animation data
    loop: true,
    autoplay: true, // Autoplay animation
  };

  return (
    <div className="lottie-brain-container">
      <Lottie options={options} height="300px" width="300px" />
    </div>
  );
};

// Robo Brain Animation
const RoboticBrain = () => {
  const options = {
    animationData: roboticBrain, // Lottie animation data
    loop: true,
    autoplay: true, // Autoplay animation
  };

  return (
    <div className="lottie-container">
      <Lottie options={options} height="100%" width="100%" />
    </div>
  );
};

// Neural Brain Animation
const NeuralNetworkAnimation = () => {
  const options = {
    animationData: networkAnimation, // Lottie animation data
    loop: true,
    autoplay: true, // Autoplay animation
  };

  return (
    <div className="lottie-container">
      <Lottie options={options} height="100%" width="100%" />
    </div>
  );
};
// Export both animations
export { DefaultAIAnimation, BrainAnimation, RoboticBrain, NeuralNetworkAnimation };
