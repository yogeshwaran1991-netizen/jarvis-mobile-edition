
const API_KEY = "AQ.Ab8RN6JH6CPUrLvdkNLGPOvW5ePGr-JfqQM_OlUu40qpwx-DLQ";
const MODEL = "gemini-3.6-flash";

const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const send = document.getElementById("send");

let conversation = [];

async function sendMessage() {

    const userMessage = input.value.trim();

    if (!userMessage || send.disabled) return;

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
                            text: "You are J.A.R.V.I.S, an intelligent personal AI assistant. Address the user as Sir. Be professional, helpful and precise."
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
                data?.error?.message || "Gemini API error"
            );
        }

        const aiReply = data?.candidates?.[0]?.content?.parts
            ?.filter(p => p.text)
            .map(p => p.text)
            .join("\n");

        if (!aiReply) {
            throw new Error("Gemini returned no response.");
        }

        conversation.push({
            role: "model",
            parts: [{ text: aiReply }]
        });

        loading.innerText = "J.A.R.V.I.S: " + aiReply;

    } catch (error) {

        console.error(error);

        conversation.pop();

        loading.innerText =
            "J.A.R.V.I.S ERROR: " + error.message;

    } finally {

        send.disabled = false;
        send.textContent = "SEND";
        chat.scrollTop = chat.scrollHeight;
        input.focus();

    }
}

function add(text, who) {

    const message = document.createElement("div");

    message.className = "msg " + who;
    message.innerText = text;

    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;

    return message;
}

send.addEventListener("click", sendMessage);

input.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }

});

console.log("J.A.R.V.I.S ONLINE");
