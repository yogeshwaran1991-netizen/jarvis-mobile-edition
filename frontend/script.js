
// ========================================
// J.A.R.V.I.S - GEMINI AI BRAIN
// ========================================

// YOUR API KEY
const API_KEY = "YOUR_NEW_GEMINI_API_KEY";

// GEMINI MODEL
const MODEL = "gemini-3.6-flash";

// HTML ELEMENTS
const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const send = document.getElementById("send");

// CONVERSATION MEMORY
let conversation = [];

// ========================================
// SEND MESSAGE TO GEMINI
// ========================================

async function sendMessage() {

    const userMessage = input.value.trim();

    if (!userMessage) return;

    add("YOU: " + userMessage, "user");

    input.value = "";

    send.disabled = true;
    send.textContent = "WAIT...";

    const loading = add(
        "J.A.R.V.I.S: PROCESSING...",
        "ai"
    );

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
                            text: "You are J.A.R.V.I.S, an advanced personal AI assistant inspired by Iron Man. Address the user as Sir. Be intelligent, professional, helpful and precise. Give clear answers."
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
                data?.error?.message ||
                "Gemini API connection failed."
            );
        }

        const aiReply = data?.candidates?.[0]?.content?.parts
            ?.filter(part => part.text)
            .map(part => part.text)
            .join("\n");

        if (!aiReply) {
            throw new Error("No response received from Gemini.");
        }

        // SAVE AI RESPONSE
        conversation.push({
            role: "model",
            parts: [{ text: aiReply }]
        });

        loading.innerText = "J.A.R.V.I.S: " + aiReply;

    } catch (error) {

        console.error("JARVIS ERROR:", error);

        conversation.pop();

        loading.innerText =
            "J.A.R.V.I.S ERROR: " + error.message;

    } finally {

        send.disabled = false;
        send.textContent = "SEND";

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
// SEND BUTTON
// ========================================

send.addEventListener("click", sendMessage);

// ========================================
// ENTER KEY SUPPORT
// ========================================

input.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {

        event.preventDefault();

        sendMessage();

    }

});

console.log("J.A.R.V.I.S SYSTEM INITIALISED");
