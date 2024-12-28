import React from "react";
import Lottie from "react-lottie";
import neuralAnimation from "./neural-network.json"; // Your downloaded Lottie JSON file
import brainAnimation from "./brain-animation.json"; // Your downloaded Lottie JSON file

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

// Export both animations
export { DefaultAIAnimation, BrainAnimation };
