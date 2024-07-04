import React, { useEffect, useState } from "react";
import axios from "axios";

function Translate({ language, text }) {
  const [translated, error] = useTranslation(text, language);

  // Check if translated is empty or null before rendering
  if (!translated) {
    return (
      <div className="translate">
        <label className="label">Output</label>
        {error ? <h1 className="error">{error}</h1> : <h1 className="title">*Please input text for translation*</h1>}
      </div>
    );
  }

  return (
    <div className="translate">
      <label className="label">Output</label>
      {error ? (
        <h1 className="error">{error}</h1>
      ) : (
        <h1 className="title">{translated.replace("&#39;", "'")}</h1>
      )}
    </div>
  );
}

const useTranslation = (text, language) => {
  const [translated, setTranslated] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!text) {
      return;
    }

    const cancelToken = axios.CancelToken.source();

    doTranslation(text, language, cancelToken, setTranslated, setError);

    return () => {
      try {
        cancelToken.cancel();
      } catch (err) {
        console.error("Error cancelling token", err);
      }
    };
  }, [text, language]);

  return [translated, error];
};

const doTranslation = async (input, languageCode, cancelToken, callback, errorCallback) => {
  try {
    const data = {
      from: 'en',
      to: languageCode,
      html: input
    };

    const options = {
      method: 'POST',
      url: 'https://google-translate113.p.rapidapi.com/api/v1/translator/html',
      headers: {
        'x-rapidapi-key': 'fd5ee324c8msh3e1bfe1b636309bp1e23fajsn8c5d5510bd2e',
        'x-rapidapi-host': 'google-translate113.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      data: data,
      cancelToken: cancelToken.token
    };

    const response = await axios.request(options);
    // Ensure to adjust this according to the actual API response structure
    if (response.data && response.data.trans) {
      callback(response.data.trans); // Use 'trans' property for translation
      errorCallback(""); // Clear any previous error
    } else {
      errorCallback("No translation found."); // Handle unexpected response
      callback(""); // Clear translated text
    }
  } catch (err) {
    console.error("Error during API call:", err); // Debugging log

    if (err.response && err.response.status === 429) {
      errorCallback("Too many requests. Please try again later.");
    } else {
      errorCallback("Loading...");
    }
    callback(""); // Clear translated text on error
  }
};

export default Translate;
