const QUESTIONS={
traditional:[
["Tell me about yourself.","Give a concise narrative rather than a chronological résumé."],
["Why medicine?","Use specific experiences and explain how they changed or confirmed your motivation."],
["Why this medical school?","Connect specific school features to your goals; avoid generic praise."],
["What are your strengths?","Do not just name traits. Prove one with a specific example."],
["What are your weaknesses?","Be genuine, explain what you did about it, and show growth."],
["Why should we choose you?","Explain what you contribute without sounding entitled or comparing yourself negatively to others."],
["Where do you see yourself in 10 years?","Show direction while acknowledging that your interests can evolve."],
["Tell me about a clinical experience that shaped you.","Focus on what you observed, did, learned, and how it changed your perspective."],
["Tell me about your research.","Explain the question, your role, what you learned, and why it mattered."],
["What experience on your application are you most proud of?","Be prepared to go deeper than your written description."]
],
behavioral:[
["Tell me about a time you had a conflict with a teammate.","Use situation → action → result → reflection."],
["Tell me about a failure.","Own your role; avoid blaming others."],
["Tell me about a time you received difficult feedback.","Stay open and explain what changed afterward."],
["Tell me about a mistake you made.","Show accountability, safety awareness, and learning."],
["Tell me about a time you advocated for someone.","Explain the barrier, your action, and the outcome."],
["Tell me about a leadership experience.","Show how you influenced others, not just your title."],
["Tell me about a time you had to work with someone very different from you.","Show curiosity, adaptability, and respect."]
],
mmi:[
["A classmate takes credit for your work. What would you do?","Clarify the situation, communicate directly, consider context, and escalate only if appropriate."],
["A patient refuses a recommended treatment. How would you respond?","Explore capacity, understanding, values, risks, and informed choice."],
["You are assigned to a team member who contributes very little. What do you do?","Address the issue respectfully before assuming bad intent."],
["A physician asks you to hide a mistake. What do you do?","Prioritize patient safety, honesty, and appropriate reporting."],
["Two patients need a scarce resource. How would you approach the decision?","Discuss fair criteria, transparency, stakeholders, and consistency."],
["Role-play: A frustrated patient says nobody is listening to them. Respond.","Practice empathy, de-escalation, open questions, and clear next steps."],
["Role-play: Explain a difficult medical concept to a worried family member.","Use plain language, check understanding, and respond to emotion."],
["Teamwork station: Explain a simple structure or process to a partner who cannot see your materials.","Give organized instructions, listen, adapt, and check understanding."],
["Traditional station: Why medicine?","Treat it like a traditional interview question but within the MMI time constraint."],
["Written station: In a few minutes, outline how you would approach a difficult ethical decision.","Structure your reasoning clearly; there is no magic answer."]
],
ethics:[
["A competent adult refuses a life-saving treatment. What should the physician do?","Consider autonomy, capacity, informed refusal, risks, communication, and whether coercion is present."],
["A physician refuses to provide a treatment because of personal beliefs. How should the situation be handled?","Consider patient access, professional duties, alternatives, and respectful communication."],
["A patient asks you to keep a serious diagnosis secret from their family. What factors matter?","Discuss confidentiality, patient wishes, safety, and applicable professional/legal duties."],
["A family wants treatment that the patient previously refused. How would you approach it?","Center the patient's wishes and capacity while communicating compassionately with family."],
["Two patients need one available ICU bed. How should the team decide?","Discuss consistent, ethically defensible criteria rather than personal preference."]
],
group:[
["Your group is asked to choose the most important healthcare priority. How would you participate?","Contribute without dominating. Build on others and disagree respectfully."],
["Another applicant gives an idea you disagree with. Respond.","Acknowledge their reasoning before explaining your own view."],
["A group member is very quiet. What would you do?","Create space for them without speaking for them or putting them on the spot."],
["The group is stuck and time is running out. How would you help?","Move the group forward while preserving participation and respect."]
],
panel:[
["Tell me about yourself.","Panel interviews can feel intense. Answer the person who asked while including the panel naturally."],
["Why medicine?","Stay consistent and authentic even when multiple interviewers are watching."],
["Tell me about a time you changed your mind.","Show openness rather than defensiveness."],
["An interviewer challenges your answer. How would you respond?","Acknowledge the challenge, reconsider, and defend your reasoning calmly if appropriate."]
]
};

const RUBRICS={
traditional:["Directly answers the question","Uses specific examples","Shows reflection rather than résumé recitation","Sounds authentic and conversational"],
behavioral:["Owns your role","Explains actions, not just circumstances","Shows reflection and growth","Avoids blaming or excuses"],
mmi:["Identifies the central issue","Considers multiple stakeholders","Shows empathy and nuance","Explains reasoning rather than hunting for a perfect answer"],
ethics:["Recognizes competing principles","Considers autonomy/safety/fairness","Avoids absolute judgments","Explains a defensible process"],
group:["Contributes without dominating","Builds on others' ideas","Disagrees respectfully","Makes space for quieter participants"],
panel:["Maintains composure","Answers directly","Engages multiple interviewers naturally","Handles challenge without defensiveness"],
application:["Specific to your own experiences","Can explain your role in detail","Reflects on what you learned","Connects experiences to medicine"]
};

const followUps={
"Tell me about yourself.":"You mentioned an experience that shaped you. Can you tell me more about what you learned from it?",
"Why medicine?":"What experience most challenged or changed your understanding of what it means to be a physician?",
"Why this medical school?":"You could pursue these goals at many schools. Why specifically here?",
"What are your strengths?":"Can you give me a specific example that demonstrates that strength?",
"What are your weaknesses?":"What have you actually done to improve in this area?",
"Why should we choose you?":"What would you contribute to our medical-school community that may not be obvious from your application?"
};

let mode="traditional", currentQuestion, startTime=null, timerId=null, seconds=120, mediaRecorder=null, chunks=[], recognition=null, lastScore=null;

const $=id=>document.getElementById(id);
function pick(arr){return arr[Math.floor(Math.random()*arr.length)]}
function getQuestions(){return QUESTIONS[mode]||QUESTIONS.traditional}
function formatTime(s){return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`}
function setQuestion(){
  let pool=getQuestions();
  if(mode==="mmi"){
    const type=$("mmiType").value;
    const filtered=pool.filter(q=>{
      if(type==="random")return true;
      const text=q[0].toLowerCase();
      if(type==="ethical")return text.includes("refuses")||text.includes("physician refuses")||text.includes("scarce")||text.includes("icu");
      if(type==="actor")return text.includes("role-play");
      if(type==="teamwork")return text.includes("teamwork");
      if(type==="traditional")return text.includes("traditional station")||text.includes("why medicine");
      if(type==="written")return text.includes("written station");
    });
    pool=filtered.length?filtered:pool;
  }
  currentQuestion=pick(pool);
  $("question").textContent=currentQuestion[0];
  $("hint").textContent=currentQuestion[1];
  $("modeBadge").textContent=mode==="application"?"Application Deep Dive":mode==="group"?"Group Interview":mode==="panel"?"Panel Interview":mode==="mmi"?"MMI":mode[0].toUpperCase()+mode.slice(1);
  $("challengeBtn").classList.toggle("hidden",!(mode==="panel"||mode==="group"));
  $("prepBox").classList.toggle("hidden",mode!=="mmi");
  seconds=mode==="mmi"?180:120;$("timerLabel").textContent=formatTime(seconds);
  renderRubric();
}
function renderRubric(){
  $("rubricList").innerHTML=(RUBRICS[mode]||RUBRICS.traditional).map(x=>`<li>${x}</li>`).join("");
}
function startTimer(){
  clearInterval(timerId); startTime=Date.now();
  timerId=setInterval(()=>{seconds--; $("timerLabel").textContent=formatTime(Math.max(0,seconds)); if(seconds<=0)clearInterval(timerId)},1000);
}
function analyze(text){
  const words=text.trim()?text.trim().split(/\s+/):[];
  const lower=text.toLowerCase();
  const duration=Math.max(1,Math.round((Date.now()-(startTime||Date.now()))/1000));
  const wpm=Math.round(words.length/(duration/60));
  const fillers=["um","uh","like","you know","basically","literally","sort of","kind of","i think","maybe","just"];
  let fillerCount=0; const fillerHits=[];
  fillers.forEach(f=>{const n=(lower.match(new RegExp("\\b"+f.replace(/[.*+?^${}()|[\\]\\\\]/g,"\\$&")+"\\b","g"))||[]).length;if(n){fillerCount+=n;fillerHits.push(`${f} (${n})`)}});
  const repeated=(lower.match(/\b(\w+)\s+\1\b/g)||[]);
  const red=[];
  if(/\b(idiot|stupid|lazy|drug seeker|noncompliant|difficult patient)\b/.test(lower))red.push("Judgmental patient/team language detected. Describe behavior or barriers rather than labeling a person.");
  if(/\b(don't care|do not care)\b/.test(lower))red.push("Avoid language that suggests indifference toward a patient or teammate.");
  if(/\b(hide|cover up|ignore)\b.{0,30}\b(mistake|error)\b/.test(lower))red.push("Your response may suggest concealing a mistake. Emphasize patient safety, honesty, and appropriate escalation.");
  if(/\b(they deserved|deserved it)\b/.test(lower))red.push("Avoid punitive or judgmental framing of another person.");
  if(/\b(always|never|obviously|definitely|there's only one|no question)\b/.test(lower))red.push("Absolute language can make nuanced ethical reasoning sound rigid.");
  if(/\b(i was (the|a) (leader|best|only one))\b/.test(lower))red.push("Watch for self-promotional phrasing; show impact while recognizing your team.");
  const traitWords=["detail-oriented","detail oriented","goal-driven","goal driven","hardworking","compassionate","empathetic","dedicated","passionate","organized","team player","resilient","motivated","leadership"];
  const traitHits=traitWords.filter(t=>lower.includes(t));
  const hasExample=/\b(for example|for instance|when i|during my|at my|while i|one time|i volunteered|i created|i led|i worked)\b/.test(lower);
  const hasReflection=/\b(i learned|i realized|this taught me|i would|looking back|i understand|changed my|i became)\b/.test(lower);
  const hasAction=/\b(i (created|led|organized|analyzed|developed|asked|helped|spoke|advocated|coordinated|decided|worked|followed|addressed|apologized|changed|improved))\b/.test(lower);
  let score=6;
  if(words.length>=60)score++;
  if(hasExample)score++;
  if(hasAction)score++;
  if(hasReflection)score++;
  if(fillerCount>=6)score--;
  if(wpm>175||wpm<85)score--;
  if(red.length)score-=Math.min(2,red.length);
  if(words.length<35)score-=1;
  if(score>10)score=10;if(score<1)score=1;
  return {score,words,wpm,fillerCount,fillerHits,repeated,red,traitHits,hasExample,hasReflection,hasAction};
}
function review(){
  const text=$("transcript").value.trim();
  if(!text){alert("Record an answer or paste/type your answer first.");return}
  const a=analyze(text);lastScore=a.score;
  $("review").classList.remove("hidden");$("overallScore").textContent=a.score+"/10";
  const strengths=[],improvements=[];
  if(a.hasExample)strengths.push("You used concrete-example language rather than relying only on general claims.");
  if(a.hasAction)strengths.push("You described actions you personally took.");
  if(a.hasReflection)strengths.push("You included reflection or learning.");
  if(a.words.length>=60)strengths.push("The answer has enough substance to evaluate.");
  if(!strengths.length)strengths.push("You completed the response. Now focus on making the evidence and reflection more specific.");
  if(a.traitHits.length && !a.hasExample)improvements.push(`You used trait language (${a.traitHits.slice(0,3).join(", ")}). Prove the trait with a specific story.`);
  if(!a.hasExample)improvements.push("Add a concrete example: situation → what YOU did → result → reflection.");
  if(!a.hasReflection)improvements.push("End with what you learned, how you changed, or how the experience informs your future practice.");
  if(a.fillerCount>=3)improvements.push(`Reduce filler/hedging phrases: ${a.fillerHits.join(", ")}.`);
  if(a.wpm>175)improvements.push(`Your estimated pace is ${a.wpm} WPM. Slow down and pause between ideas.`);
  if(a.wpm>0&&a.wpm<85)improvements.push(`Your estimated pace is ${a.wpm} WPM. Make sure the answer has enough detail and energy.`);
  if(a.words.length<45)improvements.push("Your answer is quite short. Add one specific example and a reflection rather than padding it with adjectives.");
  if(!improvements.length)improvements.push("Keep the specificity and reflection. Next, practice answering the follow-up without sounding memorized.");
  $("strengths").innerHTML=strengths.map(x=>`<li>${x}</li>`).join("");
  $("improvements").innerHTML=improvements.map(x=>`<li>${x}</li>`).join("");
  $("redFlags").innerHTML=(a.red.length?a.red:["No major red-flag phrases detected by this rule-based check. Remember that the tool cannot judge tone or context perfectly."]).map(x=>`<li>${x}</li>`).join("");
  $("delivery").innerHTML=`<p><b>${a.words.length}</b> words • estimated <b>${a.wpm||"—"} WPM</b></p><p>Filler/hedging count: <b>${a.fillerCount}</b>. Repeated-word pairs: <b>${a.repeated.length}</b>.</p>`;
  let specific="";
  if(mode==="traditional")specific="Treat the answer as a conversation, not a recitation. Interviewers may or may not have read your application, so make the answer understandable on its own.";
  if(mode==="behavioral")specific="Use a clear story. Spend most of the answer on what you did and what you learned, not on setting the scene.";
  if(mode==="mmi")specific="There is not necessarily one hidden correct answer. Make your reasoning visible, identify stakeholders, acknowledge tradeoffs, and communicate with empathy.";
  if(mode==="ethics")specific="Avoid jumping to an absolute conclusion. Explain the competing principles and how you would gather information before acting.";
  if(mode==="group")specific="The goal is neither to be the alpha nor the sheep. Contribute, build on others, make room for quieter people, and disagree respectfully.";
  if(mode==="panel")specific="A panel may feel intense or include challenging signals. Stay composed, answer the question directly, and do not become defensive.";
  if(mode==="application")specific="Be able to go deeper than your written application: your role, a specific moment, what surprised you, what you learned, and how the experience changed you.";
  $("specificFeedback").textContent=specific;
  const q=followUps[currentQuestion?.[0]]||pick([
    "Can you give me a specific example?",
    "What did YOU personally do in that situation?",
    "What did you learn from that experience?",
    "How did that experience change the way you approach medicine?",
    "What would you do differently if you faced the situation again?"
  ]);
  $("followUp").innerHTML=`<p><b>Interviewer:</b> ${q}</p><p class="hint">Try answering this follow-up without repeating your first answer word-for-word.</p>`;
  $("review").scrollIntoView({behavior:"smooth"});
}
function saveAttempt(){
  if(lastScore==null)return;
  const arr=JSON.parse(localStorage.getItem("medcoach_attempts")||"[]");
  arr.push({score:lastScore,mode,date:new Date().toISOString()});localStorage.setItem("medcoach_attempts",JSON.stringify(arr));updateStats();alert("Saved locally in this browser.");
}
function updateStats(){
  const arr=JSON.parse(localStorage.getItem("medcoach_attempts")||"[]");
  $("attemptCount").textContent=arr.length;
  if(arr.length){const scores=arr.map(x=>x.score);$("avgScore").textContent=(scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1);$("bestScore").textContent=Math.max(...scores)}
}
function saveApplication(){
  const data={personalStatement:$("personalStatement").value,clinical:$("clinical").value,research:$("research").value,activities:$("activities").value,meaningful:$("meaningful").value,school:$("school").value};
  localStorage.setItem("medcoach_application",JSON.stringify(data));alert("Saved locally in this browser.");
}
function loadApplication(){
  const d=JSON.parse(localStorage.getItem("medcoach_application")||"null");if(!d)return;
  Object.keys(d).forEach(k=>{if($(k))$(k).value=d[k]||""});
}
function generateAppQuestions(){
  const fields=[["clinical","clinical experience"],["research","research"],["activities","service, leadership, or activities"],["meaningful","most meaningful experiences"],["personalStatement","personal statement"],["school","school-specific fit"]];
  const out=[];
  fields.forEach(([id,label])=>{const t=$(id).value.trim();if(!t)return;
    const sentences=t.split(/[.!?]\s+/).filter(x=>x.trim()).slice(0,3);
    out.push(`Tell me more about your ${label}.`);
    if(sentences.length)out.push(`What did YOU personally do in the experience you described in your ${label}?`);
    out.push(`What did you learn from that ${label} experience, and how has it influenced your path toward medicine?`);
  });
  if($("school").value.trim()){out.push("Why this school rather than another medical school?");out.push("What specific aspect of this school would you contribute to or engage with?");}
  $("appQuestions").innerHTML=(out.length?out:["Add some application material above first."]).map(q=>`<div class="generated-question">${q}</div>`).join("");
}
function challenge(){
  const challenges=[
    "I don't really agree with your answer. Can you explain why you see it that way?",
    "What if your first approach did not work?",
    "Could there be another perspective you're missing?",
    "Why should I believe you would actually behave that way under pressure?"
  ];
  $("question").textContent=pick(challenges);$("hint").textContent="Stay calm. Acknowledge the challenge, reconsider, then explain your reasoning.";
  $("modeBadge").textContent="Challenge follow-up";$("transcript").value="";
}
function setupSpeech(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){$("micStatus").textContent="Speech recognition is not supported here. You can still record audio and type/paste your transcript.";return}
  recognition=new SR();recognition.continuous=true;recognition.interimResults=true;
  recognition.onresult=e=>{
    let finalText="", interim="";
    for(let i=e.resultIndex;i<e.results.length;i++){const s=e.results[i][0].transcript;if(e.results[i].isFinal)finalText+=s+" ";else interim+=s}
    const existing=$("transcript").dataset.final||"";
    $("transcript").dataset.final=existing+finalText;
    $("transcript").value=$("transcript").dataset.final+(interim?" "+interim:"");
  };
  recognition.onerror=()=>{$("micStatus").textContent="Speech recognition stopped or was unavailable; your recording can still be played."};
}
$("mode").addEventListener("change",e=>{mode=e.target.value;$("traditionalFormatWrap").classList.toggle("hidden",mode!=="traditional");$("mmiTypeWrap").classList.toggle("hidden",mode!=="mmi");if(mode==="application"){mode="application"}setQuestion()});
$("mmiType").addEventListener("change",setQuestion);
$("newQuestion").addEventListener("click",()=>{setQuestion();$("transcript").value="";$("transcript").dataset.final=""});
$("startTimer").addEventListener("click",startTimer);
$("reviewBtn").addEventListener("click",review);
$("saveBtn").addEventListener("click",saveAttempt);
$("saveApplication").addEventListener("click",saveApplication);
$("generateApp").addEventListener("click",generateAppQuestions);
$("challengeBtn").addEventListener("click",challenge);
$("recordBtn").addEventListener("click",async()=>{
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});
    chunks=[];mediaRecorder=new MediaRecorder(stream);startTime=Date.now();
    mediaRecorder.ondataavailable=e=>chunks.push(e.data);
    mediaRecorder.onstop=()=>{const blob=new Blob(chunks,{type:"audio/webm"});$("audio").src=URL.createObjectURL(blob);$("audio").classList.remove("hidden");stream.getTracks().forEach(t=>t.stop())};
    mediaRecorder.start();$("recordBtn").disabled=true;$("stopBtn").disabled=false;$("micStatus").textContent="Recording…";
    if(recognition){$("transcript").dataset.final=$("transcript").value;try{recognition.start()}catch(e){}}
  }catch(e){$("micStatus").textContent="Microphone permission was denied or unavailable. You can type/paste your answer instead."}
});
$("stopBtn").addEventListener("click",()=>{if(mediaRecorder&&mediaRecorder.state!=="inactive")mediaRecorder.stop();if(recognition)try{recognition.stop()}catch(e){}$("recordBtn").disabled=false;$("stopBtn").disabled=true;$("micStatus").textContent="Recording stopped."});
setupSpeech();loadApplication();updateStats();setQuestion();