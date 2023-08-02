import React from "react";
import "./style.css";

export const Window = () => {
  return (
    <div className="window">
      <div className="todo-topic-card">
        <div className="left-part">
          <div className="text-wrapper">angle-left</div>
          <div className="div">TODO TITILE</div>
        </div>
        <h1 className="text-wrapper">plus</h1>
      </div>
      <div className="todo-card">
        <div className="todo-title">TODO TITILE</div>
        <div className="tools">
          <div className="progress-text">(X/X)</div>
          <div className="text-wrapper-2">trash</div>
          <div className="text-wrapper-2">angle-right</div>
        </div>
      </div>
      <div className="todo-card">
        <div className="todo-title">TODO TITILE</div>
        <div className="tools">
          <div className="progress-text">(X/X)</div>
          <div className="text-wrapper-2">trash</div>
          <div className="text-wrapper-3">angle-right</div>
        </div>
      </div>
    </div>
  );
};
