import axios from "axios";
import { LANGUAGE_VERSIONS } from "@/app/constants";

const API = axios.create({
  baseURL: "https://emkc.org/api/v2/piston",
});

export const executeCode = async (language, sourceCode) => {
  try {
    console.log('Executing code:', { language, version: LANGUAGE_VERSIONS[language] });
    
    const response = await API.post("/execute", {
      language: language,
      version: LANGUAGE_VERSIONS[language],
      files: [
        {
          content: sourceCode,
        },
      ],
    });
    
    console.log('Piston API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Piston API error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error(error.response?.data?.message || error.message || 'Failed to execute code');
  }
};
