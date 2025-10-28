import { useEffect, useState } from "react";
import { faker } from "@faker-js/faker";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useThread } from "./hooks/useThread";

const NAME = "ABC";

const Chat = () => {
  const {
    threadId,
    resetThread: newThread,
    setThreadId,
  } = useThread("Basic Chat Example");

  const messages = useQuery(api.chat.listThreadMessages, {
    threadId: threadId,
    paginationOpts: { numItems: 10, cursor: null },
  });

  // TODO: Add mutation hook here.
  const sendMessage = useMutation(api.chat.sendThreadMessage);

  const [newMessageText, setNewMessageText] = useState("");

  useEffect(() => {
    // Make sure scrollTo works on button click in Chrome
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 0);
  }, [messages]);

  return (
    <div>
      <header>
        <h1>Convex Chat</h1>
        <p>
          Connected as <strong>{threadId}</strong>
        </p>
      </header>
      {messages?.page?.reverse().map((message) => (
        <article
          key={message._id}
          className={message.user === NAME ? "message-mine" : ""}
        >
          <div>{message.userId}</div>

          <p>{message.text}</p>
        </article>
      ))}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await sendMessage({ threadId: threadId, prompt: newMessageText });
          setNewMessageText("");
        }}
      >
        <input
          value={newMessageText}
          onChange={async (e) => {
            const text = e.target.value;
            setNewMessageText(text);
          }}
          placeholder="Write a message…"
          autoFocus
        />
        <button type="submit" disabled={!newMessageText}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
