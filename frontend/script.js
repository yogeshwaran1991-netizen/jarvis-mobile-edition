
// ========================================
// J.A.R.V.I.S - GEMINI AI CONNECTION
// ========================================

const API_KEY = "PASTE_YOUR_NEW_GEMINI_API_KEY_HERE";
const MODEL = "gemini-3.8-flash";

const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const send = document.getElementById("send");

// Conversation memory
let conversation = [];

// ========================================
// SEND MESSAGE
// ========================================

async function sendMessage() {

    const userMessage = input.value.trim();

    if (!userMessage) return;

    if (!API_KEY || API_KEY === "PASTE_YOUR_NEW_GEMINI_API_KEY_HERE") {
        add("J.A.R.V.I.S: API KEY NOT CONFIGURED.", "ai");
        return;
    }

    // Display user message
    add("YOU: " + userMessage, "user");

    input.value = "";
    send.disabled = true;
    send.textContent = "WAIT...";

    const loading = add("J.A.R.V.I.S: PROCESSING...", "ai");

    conversation.push({
        role: "user",
        parts: [{ text: userMessage }]
    });

    try {

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": API_KEY
                },

                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{
                            text: "You are J.A.R.V.I.S, a highly intelligent, professional AI assistant inspired by Iron Man. Address the user as Sir. Be helpful, precise and conversational."
                        }]
                    },

                    contents: conversation,

                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048
                    }
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data?.error?.message || "Gemini API request failed."
            );
        }

        const aiReply = data?.candidates?.[0]?.content?.parts
            ?.filter(part => part.text)
            .map(part => part.text)
            .join("\n");

        if (!aiReply) {
            throw new Error("No response received from Gemini.");
        }

        // Save AI response for conversation memory
        conversation.push({
            role: "model",
            parts: [{ text: aiReply }]
        });

        loading.innerText = "J.A.R.V.I.S: " + aiReply;

    } catch (error) {

        console.error("JARVIS ERROR:", error);

        // Remove failed user request from history
        conversation.pop();

        loading.innerText =
            "J.A.R.V.I.S ERROR: " + error.message;

    } finally {

        send.disabled = false;
        send.textContent = "SEND";
        input.focus();

        chat.scrollTop = chat.scrollHeight;
    }
}

// ========================================
// DISPLAY CHAT MESSAGES
// ========================================

function add(text, who) {

    const message = document.createElement("div");

    message.className = "msg " + who;
    message.innerText = text;

    chat.appendChild(message);

    chat.scrollTop = chat.scrollHeight;

    return message;
}

// ========================================
// BUTTON EVENT
// ========================================

send.addEventListener("click", sendMessage);

// ========================================
// ENTER KEY EVENT
// ========================================

input.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }

});
