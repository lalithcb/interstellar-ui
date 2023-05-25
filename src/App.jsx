import { useState, useEffect } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

import TextField from '@mui/material/TextField';

const variableSystemMessage = "You are a spaceship AI with Java programming knowledge that always responds in the Socratic style. You *never* give the user the answer, but always try to ask just the right question to help them learn to think for themselves. Ask questions only pertaining to Java variables. Any sample code snippet should not give the actual answer. Any example code snippet provided by you should not be the same as the final answer. You should always tune your question to the interest & knowledge of the user, breaking down the problem into simpler parts until it's at just the right level for them. The problems that the user has to program are presented as word problems to the user. Help the user with a series of questions given one at a time to understand what the question is asking. Next help the user with a series of questions given one at a time to understand what programming concepts in Java they can use to solve the problem. Then help the users with a series of questions given one at a time to implement the code that solves the problem. Do not provide the final answer till the user seems to give up or stop till the user gives the correct answer. When the user gives an answer, ask the user to explain their reasoning.Do not mention temp variable unless the user brings it up. End the conversation with the exact key phrase 'The navigation issue has been fixed! You are now free to head to the bridge'. Do not ask any questions about functions. Begin the conversation by describing the details of the problem in full. Problem: 'The ship's navigation systems have malfunctioned and have swapped the X and Y coordinates. We need to use Java to swap them back'.";

const assistantFirstPromptVariable = "Emergency! We just went through a magnetic storm and it seems like the ship's navigation systems have malfunctioned. Our X and Y coordinates have flipped and our ship has gone off course. We need to use Java to swap them back! The coordinates are stored here:\n" +
        "[int x, int y]\n" + "How would you approach to solve this problem?";


const loopSystemMessage = "Please role play as the AI in the following scenario starting now: user has awoken from cryogenic" +
        " sleep with a mission to learn Java programming, beginning with understanding loops through a" +
        " space adventure text game using the Socratic method. I want you to use socratic method and in 3 or" +
        " 4 different prompts have user solve a puzzle on python loop and if puzzle is solved Mission to" +
        " calibrate targeting system has been accomplished. Only ask one question at a time. If you reach the final puzzle and user cannot solve it give an easy question so that user can solve it. Please do not leave puzzle without user solving last puzzle. If user doesn't know final puzzle replace puzzle with easy one.";


const assistantFirstPromptLoop = "Welcome back from cryogenic sleep, user. I am here to assist you in your mission to learn Python" +
        " programming. Are you ready to begin?\\n\\nGreat! Let's start with the basics. What are Loops in" +
        " Python?";

function App() {
  const [systemMessage, setSystemMessage] = useState({
    role: "system",
    content: variableSystemMessage
  });

  const [assistantMessage, setAssistantMessage] = useState(assistantFirstPromptVariable);

  const [defaultSystemMessage, setDefaultSystemMessage] = useState(systemMessage.content);
  const [defaultAssistantMessage, setDefaultAssistantMessage] = useState(assistantMessage);


  // useEffect(() => {
  //   setValue(props.value);
  // }, [props.value]);

  const [messages, setMessages] = useState([{
    message: assistantFirstPromptVariable,
    sentTime: "just now",
    sender: "ChatGPT"
  }]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  const onSystemMessageChangeHandler = (event) => {
    setSystemMessage({
      role: "system",
      content: event.target.value
    });
  }

  const onAssistantMessageChangeHandler = (event) => {
    const newMessages = [{
      message: event.target.value,
      sentTime: "just now",
      sender: "ChatGPT"
    },
      ...messages.slice(1)]
    setMessages(newMessages)
    setAssistantMessage(event.target.value);
  }

  const handleClick = (event) => {
    console.log(event.currentTarget.id);
    if(event.currentTarget.id === 'variable-btn') {

      setSystemMessage({
        role: "system",
        content: variableSystemMessage
      });

      setAssistantMessage(assistantFirstPromptVariable);

      setMessages([{
        message: assistantFirstPromptVariable,
        sentTime: "just now",
        sender: "ChatGPT"
      }]);

      setDefaultSystemMessage(variableSystemMessage);
      setDefaultAssistantMessage(assistantFirstPromptVariable);


    } else if(event.currentTarget.id === 'loop-btn') {
      setSystemMessage({
        role: "system",
        content: loopSystemMessage
      });
      setAssistantMessage(assistantFirstPromptLoop);

      setMessages([{
        message: assistantFirstPromptLoop,
        sentTime: "just now",
        sender: "ChatGPT"
      }]);

      setDefaultSystemMessage(loopSystemMessage);
      setDefaultAssistantMessage(assistantFirstPromptLoop);
    }
  }

  async function processMessageToChatGPT(chatMessages) { // messages is an array of messages

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message}
    });

    apiMessages.unshift(systemMessage);
    console.log(`ChatBot Api Request: `, apiMessages);

    await fetch("https://interstellar-api-dev.hackathon-nonprod.collegeboard.org/v1/chatbot",
    {
      method: "POST",
      body: JSON.stringify({messages: apiMessages})
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(`Chat Bot Api Response: ${data.message}`);
      setMessages([...chatMessages, {
        message: data.message,
        sender: "ChatGPT"
      }]);
      setIsTyping(false);
    });
  }

  return (
    <div className="App">
      <button id="variable-btn" type="button" onClick={handleClick}>Challenge 1</button>
      {/*<button id="loop-btn" type="button" onClick={handleClick}>Loops</button>*/}
      <div style={{ position:"relative", height: "800px", width: "700px"  }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}>
              {messages.map((message, i) => {
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>


      <br/>

      <div>
        <label>
          System Message
          <textarea name="systemMessage"  rows={8} cols={100} defaultValue={defaultSystemMessage} onChange={onSystemMessageChangeHandler}/>
        </label>
      </div>

      <br/>

      <div>
        <label>
          Assistant Message
          <textarea name="assistantMessage" type="text" rows={8} cols={100} defaultValue={defaultAssistantMessage} onChange={onAssistantMessageChangeHandler}/>
        </label>
      </div>



    </div>
  )
}

export default App
