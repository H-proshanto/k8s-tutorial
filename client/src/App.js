import React, { useState } from "react";
import PostCreate from "./PostCreate";
import PostList from "./PostList";

const App = () => {
  const [newAvailable, setNewAvailable] = useState(false);

  return (
    <div className="container">
      <h1>Create Post</h1>
      <PostCreate setNewAvailable={setNewAvailable} />
      <hr />
      <h1>Posts</h1>
      <PostList newAvailable={newAvailable} setNewAvailable={setNewAvailable} />
    </div>
  );
};
export default App;
