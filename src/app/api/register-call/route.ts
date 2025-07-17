// import { logger } from "@/lib/logger";
// import { InterviewerService } from "@/services/interviewers.service";
// import { NextResponse } from "next/server";
// import Retell from "retell-sdk";

// const retellClient = new Retell({
//   apiKey: process.env.RETELL_API_KEY || "",
// });

// // Your Retell AI agent ID
// const DEFAULT_AGENT_ID = "agent_605717ca33a2e47ab9693b3b61"; 

// export async function POST(req: Request, res: Response) {
//   logger.info("register-call request received");

//   try {
//     const body = await req.json();

//     const interviewerId = body.interviewer_id;
//     const interviewer = await InterviewerService.getInterviewer(interviewerId);

//     // Use interviewer's agent_id if available, otherwise use default
//     const agentId = interviewer?.agent_id && interviewer.agent_id.trim() !== '' 
//       ? interviewer.agent_id 
//       : DEFAULT_AGENT_ID;

//     logger.info(`Using agent_id: ${agentId}`);

//     const registerCallResponse = await retellClient.call.createWebCall({
//       agent_id: agentId,
//       retell_llm_dynamic_variables: body.dynamic_data,
//     });

//     logger.info("Call registered successfully");

//     return NextResponse.json(
//       {
//         registerCallResponse,
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     logger.error("Error registering call:", error);
//     return NextResponse.json(
//       {
//         error: "Failed to register call",
//         details: error instanceof Error ? error.message : "Unknown error"
//       },
//       { status: 500 },
//     );
//   }
// }



import { logger } from "@/lib/logger";
import { InterviewerService } from "@/services/interviewers.service";
import { NextResponse } from "next/server";
import Retell from "retell-sdk";

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});

// Your Retell AI agent ID
const DEFAULT_AGENT_ID = "agent_605717ca33a2e47ab9693b3b61"; 

export async function POST(req: Request, res: Response) {
  logger.info("register-call request received");

  try {
    const body = await req.json();

    const interviewerId = body.interviewer_id;
    const interviewer = await InterviewerService.getInterviewer(interviewerId);

    // Use interviewer's agent_id if available, otherwise use default
    const agentId = interviewer?.agent_id && interviewer.agent_id.trim() !== '' 
      ? interviewer.agent_id 
      : DEFAULT_AGENT_ID;

    logger.info(`Using agent_id: ${agentId}`);

    const registerCallResponse = await retellClient.call.createWebCall({
      agent_id: agentId,
      retell_llm_dynamic_variables: body.dynamic_data,
    });

    logger.info("Call registered successfully");

    return NextResponse.json(
      {
        registerCallResponse,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Error registering call:", error);
    
    return NextResponse.json(
      {
        error: "Failed to register call",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 },
    );
  }
}
