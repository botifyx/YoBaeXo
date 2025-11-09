import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  KeyboardEvent,
  ReactNode,
} from "react";
import { MessageCircle, Send, X, Music, ExternalLink } from "lucide-react";
import { youtubeAPI, YouTubePlaylist } from "../lib/api";

interface Message {
  content: ReactNode;
  isUser: boolean;
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      content:
        "Hi! I'm YoBaeXo's assistant. Ask about albums, songs, contact, or anything on the site! 🎵",
      isUser: false,
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await youtubeAPI.getPlaylists(5);
      if (response.success) {
        setPlaylists(response.playlists);
      }
    } catch (err) {
      console.error("Error loading playlists for bot:", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { content: input, isUser: true };
    setMessages((prev: Message[]) => [...prev, userMsg]);
    setLoading(true);
    setInput("");

    // Process query
    const lowerInput = input.toLowerCase();
    let botContent: ReactNode = <span>Thinking...</span>;

    if (
      lowerInput.includes("hello") ||
      lowerInput.includes("hi") ||
      lowerInput.includes("hey")
    ) {
      botContent = (
        <>
          Hello! I can help with albums, songs, licensing, donations, or site
          navigation. What do you need? 🎧
        </>
      );
    } else if (lowerInput.includes("album") || lowerInput.includes("albums")) {
      if (playlists.length > 0) {
        botContent = (
          <div className="space-y-2">
            <p className="font-semibold">Featured Albums:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {playlists.map((p: YouTubePlaylist) => (
                <li key={p.id} className="flex items-center justify-between">
                  <span className="flex-1">
                    <Music className="h-3 w-3 inline mr-1" />
                    {p.title} ({p.videoCount} tracks)
                  </span>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-cyan-400 hover:text-cyan-300 text-xs flex items-center"
                  >
                    View <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-gray-400">
              Visit{" "}
              <a href="/albums" className="text-pink-400 hover:underline">
                /albums
              </a>{" "}
              for full details!
            </p>
          </div>
        );
      } else {
        botContent = (
          <>
            Albums are loaded from YouTube. Check the{" "}
            <a href="/albums" className="text-pink-400 hover:underline">
              Albums page
            </a>
            !
          </>
        );
      }
    } else if (
      lowerInput.includes("song") ||
      lowerInput.includes("songs") ||
      lowerInput.includes("track")
    ) {
      botContent = (
        <>
          All songs are organized in albums. Ask about "albums" to see
          collections, or visit{" "}
          <a href="/albums" className="text-pink-400 hover:underline">
            /albums
          </a>{" "}
          to browse and play tracks! 🎶
        </>
      );
    } else if (
      lowerInput.includes("licensing") ||
      lowerInput.includes("license")
    ) {
      botContent = (
        <>
          For music licensing, visit the{" "}
          <a href="/licensing" className="text-pink-400 hover:underline">
            Licensing page
          </a>
          . You can use tracks for projects with proper attribution. 📝
        </>
      );
    } else if (
      lowerInput.includes("donate") ||
      lowerInput.includes("support")
    ) {
      botContent = (
        <>
          Support YoBaeXo on the{" "}
          <a href="/donate" className="text-pink-400 hover:underline">
            Donate page
          </a>
          . Your contributions help create more music! ❤️
        </>
      );
    } else if (lowerInput.includes("contact")) {
      botContent = (
        <>
          Get in touch on the{" "}
          <a href="/contact" className="text-pink-400 hover:underline">
            Contact page
          </a>
          . For collaborations or inquiries, use the form there. ✉️
        </>
      );
    } else if (lowerInput.includes("privacy")) {
      botContent = (
        <>
          Privacy policy is at{" "}
          <a href="/privacy" className="text-pink-400 hover:underline">
            /privacy
          </a>
          . We respect your data and use it only for site functionality. 🔒
        </>
      );
    } else if (lowerInput.includes("remix")) {
      botContent = (
        <>
          Visit the{" "}
          <a href="/remix" className="text-pink-400 hover:underline">
            Remix page
          </a>{" "}
          for fan creations and guidelines. 🎛️
        </>
      );
    } else if (lowerInput.includes("home") || lowerInput.includes("main")) {
      botContent = (
        <>
          Welcome to the home page:{" "}
          <a href="/" className="text-pink-400 hover:underline">
            /
          </a>
          . Explore featured albums and latest videos there. 🏠
        </>
      );
    } else {
      botContent = (
        <>
          I can help with: albums, songs, licensing, donate, contact, privacy,
          or remixes. Try asking <b>"show albums"</b> or <b>"how to contact"</b>
          ! ❓
        </>
      );
    }

    setTimeout(() => {
      setMessages((prev: Message[]) => [
        ...prev,
        { content: botContent, isUser: false },
      ]);
      setLoading(false);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 w-96 h-[600px] bg-gray-900/95 border border-gray-700/50 rounded-2xl shadow-2xl flex flex-col z-50 backdrop-blur-md animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 via-cyan-500 to-violet-500 p-4 rounded-t-2xl flex justify-between items-center shadow-lg">
        <div className="flex items-center">
          <div className="p-2 bg-white/10 rounded-full mr-2">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-white font-semibold font-poppins text-lg">
            YoBaeXo Assistant
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-all duration-200 p-2 rounded-full hover:bg-white/20 hover:scale-110"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-800/50">
        {messages.map((msg: Message, i: number) => (
          <div
            key={i}
            className={`mb-4 flex ${
              msg.isUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-xl shadow-md ${
                msg.isUser
                  ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white animate-slideInRight"
                  : "bg-gray-700/80 text-gray-100 backdrop-blur-sm animate-slideInLeft border border-gray-600/50"
              }`}
            >
              {typeof msg.content === "string" ? (
                <p className="text-sm whitespace-pre-wrap break-words">
                  {msg.content}
                </p>
              ) : (
                <div className="text-sm prose prose-invert max-w-none break-words">
                  {msg.content}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start mb-3">
            <div className="bg-gray-700 text-gray-400 p-3 rounded-lg">
              <p className="text-sm">Typing...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700 bg-gray-900">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setInput(e.target.value)
            }
            onKeyPress={(e: KeyboardEvent<HTMLInputElement>) =>
              e.key === "Enter" && handleSend()
            }
            className="flex-1 bg-gray-800/50 text-white border border-gray-600/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-400 transition-all duration-200 hover:border-gray-500"
            placeholder="Ask about albums, songs, or site... 💬"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-gradient-to-r from-pink-500 to-violet-500 text-white p-2 rounded-lg hover:from-pink-600 hover:to-violet-600 disabled:opacity-50 transition-all flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
