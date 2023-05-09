import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import Layout from '@/components/layout';
import styles from '@/styles/Home.module.css';
import { Message } from '@/types/chat';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import Image from 'next/image';
import LoadingDots from '@/components/ui/LoadingDots';
import { AiOutlineSend } from 'react-icons/ai';
import { Document } from 'langchain/document';

export default function Chatbot() {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [
      {
        message: 'Hi, what would you like to learn about DFCC Bank?',
        type: 'apiMessage',
      },
    ],
    history: [],
    pendingSourceDocs: [],
  });
  const { messages, pending, history, pendingSourceDocs } = messageState;
  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [id, setId] = useState('');
  const [checkNotSure, setCheckNotSure] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [showChatRating, setShowChatRating] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agentInfoMsg, setAgentInfoMsg] = useState(false);
  const [agentImage, setAgentImage] = useState('/chat-header.png');
  const [greeting, setGreeting] = useState(false);






  useEffect(() => {
    const now = Date.now();
    const newId = now.toString();
    setId(newId);
  }, []);
  // console.log('user id : ',id)

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  useEffect(() => {
    // console.log("text there : ", checkNotSure)
  }, [checkNotSure, agentName, agentInfoMsg, agentImage, greeting]);








  //handle form submission
  async function handleSubmit(e: any) {
    // if (liveAgent === false) {
    e.preventDefault();

    setError(null);

    if (!query) {
      alert('Please input a question');
      return;
    }
    // get user message
    let question = query.trim();

    // set user message array
    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: 'userMessage',
          message: question,
        },
      ],
      pending: undefined,
    }));

    console.log('user message : ', question);

    setLoading(true);
    setQuery('');
    setMessageState((state) => ({ ...state, pending: '' }));

    const ctrl = new AbortController();

    // const greetingTypes = [
    //   "Hi", 
    //   "Hello", 
    //   "Hi,there", 
    //   "Good morning", 
    //   "Thank you", 
    //   "How are you ?", 
    //   "How are you bot", 
    //   "What is your name",
    //   "Good afternoon", 
    //   "Good evening", 
    //   "Good night",
    // ];
    // const regex = new RegExp(`^(${greetingTypes.join("|")})$`, "i");
    // const greetingIncluded = regex.test(question.trim());

    // const greetingTypes = [
    // ["What is your name", "My name is DFCC GPT."],
    // ["Who is your creator", "My creator is xyz"],
    // ];

    // const matchedGreetingType = greetingTypes.find(([greeting]) => greeting.toLowerCase() === question.toLowerCase());

    // const regex = new RegExp(`^(${greetingTypes.map(([greeting]) => greeting).join("|")})$`, "i");
    // const greetingMatch = question.trim().match(regex);

    const response = await fetch("/api/botInformationCheck", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: question }),
    });

    const data = await response.json();
    if (response.status !== 200) {
      throw data.error || new Error(`Request failed with status ${response.status}`);
    }
    const matchedGreetingType = data.info_result;
    console.log("matchedGreetingType : ", matchedGreetingType )

    if(matchedGreetingType.toLowerCase().includes("name")){
        // const [, reply] = matchedGreetingType;

        // console.log(reply);

        setTimeout(()=>{
          setMessageState((state) => ({
            ...state,
            messages: [
              ...state.messages,
              {
                type: 'apiMessage',
                message: "My name is DFCC GPT.",
              },
            ],
            pending: undefined,
          }));
          setLoading(false);
        },3000)
    }
    else if(matchedGreetingType.toLowerCase().includes("age")){
      setTimeout(()=>{
        setMessageState((state) => ({
          ...state,
          messages: [
            ...state.messages,
            {
              type: 'apiMessage',
              message: "I'm 20 years old",
            },
          ],
          pending: undefined,
        }));
        setLoading(false);
      },3000)
    }
    else if(matchedGreetingType.toLowerCase().includes("country")){
      setTimeout(()=>{
        setMessageState((state) => ({
          ...state,
          messages: [
            ...state.messages,
            {
              type: 'apiMessage',
              message: "I live in Sri Lanka",
            },
          ],
          pending: undefined,
        }));
        setLoading(false);
      },3000)
    }
    else{
      const response = await fetch("/api/generateGreeting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: question }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }
      const isGreet = data.greet_result;
      console.log("isGreet : ", isGreet )

    if (isGreet.toLowerCase().includes("yes")) {
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: question }),
        });

        const data = await response.json();
        if (response.status !== 200) {
          throw data.error || new Error(`Request failed with status ${response.status}`);
        }

        setMessageState((state) => ({
          ...state,
          messages: [
            ...state.messages,
            {
              type: 'apiMessage',
              message: data.result,
            },
          ],
          pending: undefined,
        }));
        setLoading(false);
      } catch (error) {
        console.error(error);
      }

    } else {
      try {
        fetchEventSource('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question,
            history,
          }),
          signal: ctrl.signal,
          onmessage: async (event) => {
            if (event.data === '[DONE]') {
              setMessageState((state) => ({
                history: [...state.history, [question, state.pending ?? '']],
                messages: [
                  ...state.messages,
                  {
                    type: 'apiMessage',
                    message: state.pending ?? '',
                    sourceDocs: state.pendingSourceDocs,
                  },
                ],
                pending: undefined,
                pendingSourceDocs: undefined,
              }));
              setLoading(false);
              ctrl.abort();

            } else {
              const data = JSON.parse(event.data);
              if (data.sourceDocs) {
                setMessageState((state) => ({
                  ...state,
                  pendingSourceDocs: data.sourceDocs,
                }));
              } else {
                setMessageState((state) => ({
                  ...state,
                  pending: (state.pending ?? '') + data.data,
                }));
              }
            }
          },
        });
      } catch (error) {
        setLoading(false);
        setError('An error occurred while fetching the data. Please try again.');
        console.log('error', error);
      }
    }
    }


    // const response = await fetch('http://localhost:5000/nlp', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //       body: JSON.stringify({ question: question }),
    //     });

    //     if (response.status !== 200) {
    //       const error = await response.json();
    //       throw new Error(error.message);
    //     }
    //     const data = await response.json();
    //     const sentimentScore = data.sentimentScore;
    // const greetingMatch = data;
    // console.log('sentiment : ', greetingMatch);
    // try {
      

  }







  //prevent empty submissions
  const handleEnter = useCallback(
    (e: any) => {
      if (e.key === 'Enter' && query) {
        handleSubmit(e);
        // handleLiveAgent(e);
      } else if (e.key == 'Enter') {
        e.preventDefault();
      }
    },
    [query],
  );








  const chatMessages = useMemo(() => {
    return [
      ...messages,
      ...(pending
        ? [
          {
            type: 'apiMessage',
            message: pending,
            sourceDocs: pendingSourceDocs,
          },
        ]
        : []),
    ];
  }, [messages, pending, pendingSourceDocs]);
  // console.log(messages);

  // console.log('messages : ', messages);



  //scroll to bottom of chat
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [chatMessages]);

  console.log(messages)





  return (
    <Layout>
      {/* chat top header */}
      <div className={`${styles.chatTopBar} d-flex flex-row `}>
        <div className="text-center d-flex flex-row justify-content-between px-2">
          <Image src="/chat-top-bar.png" alt="AI" width={150} height={30} />
        </div>
      </div>



      <div className={`${styles.messageWrapper}`}>


        <div className={styles.botMessageContainerWrapper}>
          <div className="d-flex justify-content-center pt-1">
            <Image src="/chat-logo.png" alt="AI" width={180} height={50} />
          </div>
        </div>




        <div
          ref={messageListRef}
          className={`${styles.messageContentWrapper} d-flex flex-column`}
        >
          {chatMessages.map((message, index) => {
            let icon;
            let className;
            let userHomeStyles;
            let wrapper = 'align-items-end justify-content-end';
            let userStyles = 'justify-content-end flex-row-reverse float-end';

            if (message.type === 'apiMessage') {
              icon = (
                <Image
                  src={agentImage}
                  alt="AI"
                  width="40"
                  height="40"
                  className={styles.botImage}
                  priority
                />
              );
              className = styles.apimessage;
              userStyles = 'justify-content-start flex-row float-start';
              wrapper = 'align-items-start justify-content-start';

            } else {
              icon = (
                <Image
                  src="/user.png"
                  alt="Me"
                  width="40"
                  height="40"
                  className={styles.botImage}
                  priority
                />
              );
              userHomeStyles = styles.userApiStyles;
              // The latest message sent by the user will be animated while waiting for a response
              className =
                loading && index === chatMessages.length - 1
                  ? styles.usermessagewaiting
                  : styles.usermessage;
            }


            return (
              <>
                <div
                  key={`chatMessage-${index}`}
                  className={styles.botMessageContainerWrapper}
                >
                  <div
                    className={`${styles.botChatMsgContainer} ${userStyles} d-flex my-2`}
                  >
                    <div className="d-flex">{icon}</div>
                    <div className={`${wrapper} d-flex flex-column ms-2`}>
                      <div
                        className={`${styles.botMessageContainer} ${userHomeStyles} d-flex flex-column my-1`}
                      >
                        <p className="mb-0">{message.message}</p>
                      </div>

                    </div>
                  </div>
                </div>

              </>
            );
          })}



          {showChatRating && (
            <div className="d-flex flex-column" id='chatRating'>
              <div className="d-flex">
                <Image src="/chat-header.png" alt="AI" width="40" height="40" />
              </div>
              <div className={`d-flex flex-column px-1 py-2`}>
                <div
                  className={`welcomeMessageContainer d-flex flex-column align-items-center`}
                >
                  <div className="container-fluid m-0 p-0">
                    <div
                      className={`${styles.botRateRequest} d-flex flex-row my-2 mx-2`}
                    >
                      <div
                        className={`${styles.botRatingContainer} d-flex flex-column my-1`}
                      >
                        <p className={`${styles.rateTitle} mb-0 text-dark`}>
                          Rate your conversation
                        </p>
                        <p className="text-dark mb-0">Add your rating</p>
                        <div className="star-rating">
                          {[...Array(5)].map((star, index) => {
                            index += 1;
                            return (
                              <button
                                type="button"
                                key={index}
                                className={
                                  index <= (hover || rating) ? 'on' : 'off'
                                }
                                onClick={() => {
                                  setRating(index);
                                }}
                                onMouseEnter={() => setHover(index)}
                                onMouseLeave={() => setHover(rating)}
                              >
                                <span className="star">&#9733;</span>
                              </button>
                            );
                          })}
                        </div>
                        <p className={` mb-0 mt-3 text-dark`}>Your feedback :</p>
                        <textarea
                          className={`${styles.textarea} p-2 rounded`}
                          rows={3}
                          maxLength={512}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                        />

                        <button
                          className="text-white bg-dark p-2 mt-2 rounded"
                        >
                          SEND
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
          }









        </div>
      </div>

      {/* input fields =================*/}
      <div className={`${styles.inputContainer}`}>
        {/* <form > */}
        <textarea
          disabled={loading}
          onKeyDown={handleEnter}
          ref={textAreaRef}
          autoFocus={false}
          rows={1}
          maxLength={512}
          id="userInput"
          name="userInput"
          placeholder={
            loading
              ? 'Waiting for response...'
              : 'What is this question about?'
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.textarea}
        />
        <button
          // onClick={(liveAgent === false) ? handleSubmit : handleLiveAgent}
          onClick={handleSubmit}
          disabled={loading}
          className={`${styles.inputIconContainer} `}
        >
          {loading ? (
            <div className={styles.loadingwheel}>
              <LoadingDots color="#fff" />
              {/* <LoadingIcons.ThreeDots /> */}
            </div>
          ) : (
            // Send icon SVG in input field
            <AiOutlineSend className={styles.sendIcon} />
          )}
        </button>
        {/* </form> */}
      </div>
      {error && (
        <div className="border border-red-400 rounded-md p-4">
          <p className="text-red-500">{error}</p>
        </div>
      )}
      {/* input fields ================= */}
    </Layout>
  );
}
