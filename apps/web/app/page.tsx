"use client";

import { useEffect, useState } from "react";

import { io } from "socket.io-client";

export default function Home() {
  const [emails, setEmails] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [drafts, setDrafts] = useState<Record<string, string>>({});

  // FETCH EMAILS
  const fetchEmails = async () => {
    const response = await fetch("http://localhost:3000/emails");

    const data = await response.json();

    const fetchedEmails = data.emails || [];

    setEmails(fetchedEmails);

    // EDITABLE DRAFTS
    const draftMap: Record<string, string> = {};

    for (const email of fetchedEmails) {
      draftMap[email.id] = email.draft || "";
    }

    setDrafts(draftMap);

    setLoading(false);
  };

  // INITIAL FETCH
  useEffect(() => {
    fetchEmails();
  }, []);

  // REALTIME SOCKETS
  useEffect(() => {
    const socket = io("http://localhost:3000");

    socket.on(
      "connect",

      () => {
        console.log("Socket connected");
      },
    );

    socket.on(
      "draft-generated",

      async (payload) => {
        console.log(payload);

        await fetchEmails();
      },
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <main
      className="
        min-h-screen
        bg-yellow-500
        p-8
        text-black
      "
    >
      <div
        className="
          max-w-5xl
          mx-auto
        "
      >
        {/* HEADER */}
        <div
          className="
            mb-8
          "
        >
          <h1
            className="
              text-4xl
              font-bold
            "
          >
            Draftly
          </h1>

          <p
            className="
              mt-2
            "
          >
            AI Email Assistant
          </p>
        </div>

        {loading && <p>Loading...</p>}

        <div
          className="
            space-y-6
          "
        >
          {emails.map((email: any) => (
            <div
              key={email.id}
              className="
                  bg-white
                  rounded-xl
                  border
                  p-6
                  shadow-sm
                "
            >
              {/* HEADER */}
              <div
                className="
                    mb-6
                  "
              >
                <h2
                  className="
                      text-2xl
                      font-semibold
                    "
                >
                  {email.subject || "(No Subject)"}
                </h2>

                <p
                  className="
                      text-gray-500
                      mt-1
                    "
                >
                  {email.from}
                </p>
              </div>

              {/* ORIGINAL EMAIL */}
              <div
                className="
                    mb-6
                  "
              >
                <p
                  className="
                      text-sm
                      font-semibold
                      text-gray-500
                      mb-2
                    "
                >
                  ORIGINAL EMAIL
                </p>

                <div
                  className="
                      border
                      rounded-lg
                      p-4
                      whitespace-pre-wrap
                    "
                >
                  {email.body}
                </div>
              </div>

              {/* AI DRAFT */}
              <div
                className="
                    mb-6
                  "
              >
                <p
                  className="
                      text-sm
                      font-semibold
                      text-gray-500
                      mb-2
                    "
                >
                  AI GENERATED DRAFT
                </p>

                <textarea
                  value={drafts[email.id] || ""}
                  onChange={(e) =>
                    setDrafts({
                      ...drafts,

                      [email.id]: e.target.value,
                    })
                  }
                  className="
                      bg-black
                      text-white
                      rounded-lg
                      p-4
                      whitespace-pre-wrap
                      w-full
                      min-h-[220px]
                      outline-none
                      resize-none
                    "
                />
              </div>

              {/* ACTIONS */}
              <div
                className="
                    flex
                    gap-4
                  "
              >
                <button
                  onClick={async () => {
                    await fetch(
                      `http://localhost:3000/emails/${email.id}/approve`,
                      {
                        method: "POST",

                        headers: {
                          "Content-Type": "application/json",
                        },

                        body: JSON.stringify({
                          content: drafts[email.id],
                        }),
                      },
                    );

                    alert("Reply Sent");
                  }}
                  className="
                      bg-black
                      text-white
                      px-5
                      py-2
                      rounded-lg
                    "
                >
                  Approve & Send
                </button>

                <button
                  className="
                      border
                      px-5
                      py-2
                      rounded-lg
                    "
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
