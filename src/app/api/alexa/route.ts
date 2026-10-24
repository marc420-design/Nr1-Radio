/**
 * NR1 Radio — Alexa skill endpoint
 *
 * Ported from the AWS Lambda function in ../alexa-skill/lambda/index.js so the
 * skill runs here instead of on Lambda. The handler logic is unchanged; what is
 * new is the verification below.
 *
 * On Lambda, only the Alexa service could invoke the function. A public URL can
 * be called by anyone, so Alexa requires the skill to prove each request really
 * came from Alexa — signature, certificate chain, timestamp and skill id. A
 * published skill fails certification without it.
 *
 * Endpoint for the Alexa developer console:
 *   https://listen-nr1dnb.com/api/alexa
 */

import * as Alexa from "ask-sdk-core";
import type {
  Response as AlexaResponse,
  ResponseEnvelope,
  interfaces,
} from "ask-sdk-model";
import {
  SkillRequestSignatureVerifier,
  TimestampVerifier,
} from "ask-sdk-express-adapter";
import type { IncomingHttpHeaders } from "http";

// Node APIs (crypto, node-forge) — this cannot run on the Edge runtime.
export const runtime = "nodejs";
// Every request is a fresh POST from Alexa; nothing here is cacheable.
export const dynamic = "force-dynamic";

// ─── Station config ───────────────────────────────────────────────────────────
// Kept identical to the Lambda. STREAM_URL is deliberately the AzuraCast origin
// rather than the site's CDN constant: Alexa holds one long-lived connection and
// the origin is what the skill was certified against.
const STREAM_URL = "https://radio.listen-nr1dnb.com/listen/nr1_dnb_radio/radio.mp3";
const STATION_NAME = "NR1 Drum and Bass Radio";
const STATION_SUBTITLE = "Norwich, UK";
/**
 * Versioned filenames: Alexa caches artwork by URL, so replacing the file in
 * place leaves devices showing the old image. Bump the suffix when the art changes.
 */
const STATION_IMAGE = "https://listen-nr1dnb.com/icons/icon-512-v2.png";
const STATION_BACKGROUND = "https://listen-nr1dnb.com/alexa-background-v2.png";
const STREAM_TOKEN = "nr1-radio-stream";

/** Skill id, so another skill cannot point itself at this endpoint. */
const SKILL_ID = process.env.ALEXA_SKILL_ID ?? "";

const STREAM_METADATA = {
  title: STATION_NAME,
  subtitle: STATION_SUBTITLE,
  art: { sources: [{ url: STATION_IMAGE }] },
  backgroundImage: { sources: [{ url: STATION_BACKGROUND }] },
};

/** Start (or restart) the stream. Token varies for retries so Alexa treats it as new. */
function playStream(handlerInput: Alexa.HandlerInput, token = STREAM_TOKEN) {
  return handlerInput.responseBuilder.addAudioPlayerPlayDirective(
    "REPLACE_ALL",
    STREAM_URL,
    token,
    0,
    undefined,
    STREAM_METADATA,
  );
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

const LaunchRequestHandler: Alexa.RequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest";
  },
  handle(handlerInput) {
    return playStream(handlerInput)
      .speak(`Welcome to ${STATION_NAME}. Starting your stream now.`)
      .getResponse();
  },
};

const PlayRadioIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "PlayRadioIntent"
    );
  },
  handle(handlerInput) {
    return playStream(handlerInput).speak(`Playing ${STATION_NAME}.`).getResponse();
  },
};

const HelpIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput =
      `This is ${STATION_NAME}, your 24/7 Drum and Bass station from Norwich. ` +
      `You can say "play" to start the stream, "pause" to pause, or "stop" to stop. ` +
      `What would you like to do?`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const CancelAndStopIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput) {
    // getIntentName throws on non-intent requests, so the type check must
    // short-circuit ahead of it.
    if (Alexa.getRequestType(handlerInput.requestEnvelope) !== "IntentRequest") {
      return false;
    }
    const name = Alexa.getIntentName(handlerInput.requestEnvelope);
    return name === "AMAZON.CancelIntent" || name === "AMAZON.StopIntent";
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("Thanks for listening to NR1 Radio!")
      .addAudioPlayerStopDirective()
      .getResponse();
  },
};

const PauseIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.PauseIntent"
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.addAudioPlayerStopDirective().getResponse();
  },
};

const ResumeIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.ResumeIntent"
    );
  },
  handle(handlerInput) {
    return playStream(handlerInput).getResponse();
  },
};

/**
 * Stream dropped (network blip, origin hiccup) — restart it automatically.
 * A PlaybackFailed response may carry an AudioPlayer directive only, no speech.
 */
const PlaybackFailedHandler: Alexa.RequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "AudioPlayer.PlaybackFailed";
  },
  handle(handlerInput) {
    // canHandle already pinned the request type, so this narrowing is safe.
    const request = handlerInput.requestEnvelope
      .request as interfaces.audioplayer.PlaybackFailedRequest;
    const error = request.error;
    console.log(
      `PlaybackFailed: ${error?.type ?? "unknown"} - ${error?.message ?? ""}. Restarting stream.`,
    );

    return playStream(handlerInput, `${STREAM_TOKEN}-retry-${Date.now()}`).getResponse();
  },
};

/** Started, Stopped, Finished, NearlyFinished — acknowledge with an empty response. */
const AudioPlayerEventHandler: Alexa.RequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type.startsWith("AudioPlayer.");
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.getResponse();
  },
};

const SessionEndedRequestHandler: Alexa.RequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === "SessionEndedRequest";
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler: Alexa.ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error(`Alexa error handled: ${error.message}`, error.stack);

    const speakOutput = "Sorry, I had trouble doing what you asked. Please try again.";
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

// Built once per lambda/container, reused across requests.
const skill = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    PlayRadioIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    PauseIntentHandler,
    ResumeIntentHandler,
    PlaybackFailedHandler,
    AudioPlayerEventHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .create();

const signatureVerifier = new SkillRequestSignatureVerifier();
const timestampVerifier = new TimestampVerifier();

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  // The signature is computed over the exact bytes Alexa sent, so the raw body
  // must be read before any JSON parsing — re-serialising it would break it.
  const rawBody = await request.text();

  const headers = Object.fromEntries(request.headers) as IncomingHttpHeaders;

  try {
    // Request genuinely came from Alexa, signed by a live Amazon certificate.
    await signatureVerifier.verify(rawBody, headers);
    // And is recent, so a captured request cannot be replayed later.
    await timestampVerifier.verify(rawBody);
  } catch (error) {
    console.warn(
      "Rejected Alexa request:",
      error instanceof Error ? error.message : error,
    );
    return new Response("Invalid request signature", { status: 400 });
  }

  let envelope;
  try {
    envelope = JSON.parse(rawBody);
  } catch {
    return new Response("Malformed request body", { status: 400 });
  }

  // Confirm the request is aimed at this skill and not another one pointed here.
  if (SKILL_ID) {
    const applicationId =
      envelope?.context?.System?.application?.applicationId ??
      envelope?.session?.application?.applicationId;

    if (applicationId !== SKILL_ID) {
      console.warn(`Rejected Alexa request for unexpected skill id: ${applicationId}`);
      return new Response("Unexpected application id", { status: 400 });
    }
  }

  let responseEnvelope: ResponseEnvelope;
  try {
    responseEnvelope = await skill.invoke(envelope);
  } catch (error) {
    // ErrorHandler covers handler failures; this is for the SDK itself failing.
    console.error("Alexa skill invocation failed:", error);
    return new Response("Skill invocation failed", { status: 500 });
  }

  return Response.json(responseEnvelope satisfies { response: AlexaResponse });
}

/** Alexa only ever POSTs. A GET is a human or a probe — say so plainly. */
export async function GET() {
  return new Response("NR1 Radio Alexa endpoint. Alexa requests must be POSTed.", {
    status: 405,
    headers: { Allow: "POST" },
  });
}
