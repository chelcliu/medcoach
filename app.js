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
  fillers.forEach(f=>{
    const escaped=f.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
    const n=(lower.match(new RegExp("\\b"+escaped+"\\b","g"))||[]).length;
    if(n){fillerCount+=n;fillerHits.push(`${f} (${n})`)}
  });

  const repeated=(lower.match(/\b(\w+)\s+\1\b/g)||[]);
  const red=[];
  if(/\b(idiot|stupid|lazy|drug seeker|noncompliant|difficult patient)\b/.test(lower))
    red.push("Judgmental patient/team language detected. This is a meaningful professionalism concern; describe behavior or barriers instead of labeling a person.");
  if(/\b(don't care|do not care)\b/.test(lower))
    red.push("Language suggesting indifference toward a patient or teammate is a serious professionalism red flag.");
  if(/\b(hide|cover up|ignore)\b.{0,30}\b(mistake|error)\b/.test(lower))
    red.push("Your response may suggest concealing a mistake. In medicine, patient safety, honesty, and appropriate escalation are essential.");
  if(/\b(they deserved|deserved it)\b/.test(lower))
    red.push("Punitive or judgmental framing of another person can seriously damage an interview response.");
  if(/\b(always|never|obviously|definitely|there's only one|no question)\b/.test(lower))
    red.push("Absolute language can make your reasoning sound rigid, especially in ethics/MMI questions.");
  if(/\b(i was (the|a) (leader|best|only one))\b/.test(lower))
    red.push("Self-promotional phrasing can come across as arrogant. Show impact while recognizing your team.");

  const traitWords=["detail-oriented","detail oriented","goal-driven","goal driven","hardworking","compassionate","empathetic","dedicated","passionate","organized","team player","resilient","motivated","leadership","driven","caring"];
  const traitHits=traitWords.filter(t=>lower.includes(t));

  // Evidence markers: concrete details are intentionally weighted heavily.
  const hasExample=/\b(for example|for instance|when i|during my|at my|while i|one time|in my role|in my experience|a patient|a client|a teammate|a classmate|our team|we (raised|created|organized|built|developed|completed))\b/.test(lower);
  const hasAction=/\b(i (created|led|organized|analyzed|developed|asked|helped|spoke|advocated|coordinated|decided|worked|followed|addressed|apologized|changed|improved|initiated|designed|implemented|communicated|learned|responded|listened|clarified|escalated|supported|managed|tracked|built|wrote|presented|volunteered))\b/.test(lower);
  const hasResult=/\b(as a result|resulted in|because of this|we (raised|reached|achieved|completed|improved)|i (achieved|completed|improved|increased|reduced)|the outcome|ultimately|by the end|within \d+ (days|weeks|months)|received|earned)\b/.test(lower);
  const hasReflection=/\b(i learned|i realized|this taught me|i would|looking back|i understand|changed my|i became|it showed me|i now|in the future|i took away|this experience)\b/.test(lower);
  const directPatterns={
    traditional:/\b(i want to|i chose|my goal|i am|i'm|medicine|physician|doctor|medical school|my strength|my weakness|i see myself)\b/,
    behavioral:/\b(i|we|my|our|the situation|the challenge|the conflict|the mistake|feedback|failure)\b/,
    mmi:/\b(i would|i'd|i would first|i would start|i think|i believe|i would consider|i would ask|i would speak)\b/,
    ethics:/\b(i would|i'd|i think|i believe|autonomy|safety|confidentiality|capacity|fair|stakeholder|patient)\b/,
    group:/\b(i would|i'd|i agree|i disagree|build on|team|group|others|listen|contribute)\b/,
    panel:/\b(i|my|medicine|physician|experience|would|believe|think)\b/,
    application:/\b(i|my|experience|research|clinical|volunteer|project|learned|worked)\b/
  };
  const direct=directPatterns[mode]?directPatterns[mode].test(lower):words.length>30;

  // Detect likely "empty" answers rather than rewarding length alone.
  const genericOnly = traitHits.length>=1 && !hasExample && !hasAction && !hasResult && !hasReflection;
  const veryShort=words.length<30;
  const short=words.length<55;
  const extremelyLong=words.length>320;
  const offTopic = words.length>=35 && !direct;

  // Mode-specific reasoning markers.
  let nuance=false, stakeholders=false;
  if(mode==="mmi"||mode==="ethics"){
    stakeholders=/\b(patient|family|physician|doctor|nurse|team|community|public|stakeholder|others|classmate|coworker)\b/.test(lower);
    nuance=/\b(however|although|on the other hand|at the same time|depends|context|balance|trade[- ]?off|competing|consider|perspective|risk|benefit|capacity|autonomy|fairness|justice|confidentiality)\b/.test(lower);
  }
  const groupSkills=mode==="group" && /\b(agree|disagree|build on|others|listen|invite|make room|contribute|team|group)\b/.test(lower);

  // Strict scoring: start low, then earn points for evidence and interview-ready behavior.
  // A polished answer can reach 9-10; a generic or severely incomplete answer should remain low.
  let score=2.0;
  const scoreReasons=[];

  if(words.length>=45){score+=0.8;scoreReasons.push("enough substance")}
  if(words.length>=80){score+=0.5;scoreReasons.push("developed answer")}
  if(direct){score+=0.7;scoreReasons.push("answers the prompt")}
  if(hasExample){score+=1.4;scoreReasons.push("specific example")}
  if(hasAction){score+=1.1;scoreReasons.push("clear personal action")}
  if(hasResult){score+=0.7;scoreReasons.push("outcome")}
  if(hasReflection){score+=1.4;scoreReasons.push("reflection")}
  if(mode==="mmi"||mode==="ethics"){
    if(stakeholders){score+=0.8;scoreReasons.push("stakeholders")}
    if(nuance){score+=0.8;scoreReasons.push("nuance")}
  }
  if(mode==="group" && groupSkills){score+=0.9;scoreReasons.push("team interaction")}
  if(genericOnly){score-=1.4}
  if(veryShort){score-=1.5}
  else if(short){score-=0.6}
  if(offTopic){score-=1.2}
  if(fillerCount>=3){score-=Math.min(1.2, fillerCount*0.12)}
  if(wpm>180){score-=0.7}
  if(wpm>0&&wpm<75){score-=0.6}
  if(extremelyLong){score-=0.5}
  if(repeated.length>=3){score-=0.4}
  if(red.length){score-=Math.min(3.0,red.length*1.2)}

  // A truly empty/generic answer should not accidentally float to a passing score.
  if(words.length<20) score=Math.min(score,2.5);
  if(genericOnly) score=Math.min(score,4.0);
  if(red.length>=2) score=Math.min(score,4.0);
  if(!hasExample && !hasReflection && words.length<60) score=Math.min(score,4.5);

  score=Math.max(1,Math.min(10,Math.round(score*10)/10));

  let severity="strong";
  if(score<4) severity="weak";
  else if(score<6) severity="needs-work";
  else if(score<8) severity="solid";

  return {
    score,words,wpm,fillerCount,fillerHits,repeated,red,traitHits,
    hasExample,hasReflection,hasAction,hasResult,direct,genericOnly,
    veryShort,short,extremelyLong,offTopic,nuance,stakeholders,groupSkills,
    severity,scoreReasons
  };
}
function review(){
  const text=$("transcript").value.trim();
  if(!text){alert("Record an answer or paste/type your answer first.");return}
  const a=analyze(text);lastScore=a.score;
  $("review").classList.remove("hidden");
  $("overallScore").textContent=a.score+"/10";

  const strengths=[],improvements=[];
  const critical=[];

  if(a.score<=3.9){
    critical.push("This answer is not interview-ready yet. Do not move on just because you finished speaking—rebuild the answer and try again.");
  } else if(a.score<6){
    critical.push("This answer has a usable starting point, but I would not rely on it in a real medical-school interview without revision.");
  } else if(a.score<8){
    critical.push("This is workable, but there are clear opportunities to make it more specific, reflective, and memorable.");
  } else {
    critical.push("This is a strong response by the coach's rule-based criteria. Keep the structure, but continue practicing so it sounds natural rather than memorized.");
  }

  if(a.hasExample) strengths.push("You gave at least one concrete example.");
  if(a.hasAction) strengths.push("You explained actions you personally took rather than only describing the situation.");
  if(a.hasResult) strengths.push("You included an outcome or consequence.");
  if(a.hasReflection) strengths.push("You included reflection or learning.");
  if((mode==="mmi"||mode==="ethics")&&a.stakeholders) strengths.push("You considered people affected by the decision.");
  if((mode==="mmi"||mode==="ethics")&&a.nuance) strengths.push("You used nuanced language rather than treating the issue as completely black-and-white.");
  if(mode==="group"&&a.groupSkills) strengths.push("You used language that suggests collaboration and respectful group participation.");
  if(!strengths.length) strengths.push("There is not enough evidence in this response to identify a meaningful interview strength yet.");

  if(a.genericOnly){
    improvements.push("🚨 Major issue: you are telling the interviewer what kind of person you are instead of proving it. Replace adjectives like “hardworking,” “detail-oriented,” or “goal-driven” with a specific story.");
  }
  if(!a.direct){
    improvements.push("🚨 You did not clearly answer the question. Start with a direct answer in your first 1–2 sentences, then support it with evidence.");
  }
  if(!a.hasExample){
    improvements.push("You need a concrete example. Give the interviewer a real situation, not a general statement about yourself.");
  }
  if(!a.hasAction){
    improvements.push("The interviewer needs to know what YOU actually did. Use active language: “I created…,” “I organized…,” “I addressed…,” “I learned…”.");
  }
  if(!a.hasResult){
    improvements.push("Add the outcome. What changed? What did your team accomplish? What was the measurable or observable result?");
  }
  if(!a.hasReflection){
    improvements.push("🚨 Your answer is missing reflection. End with what you learned, how you changed, or how the experience will influence you as a future physician.");
  }
  if(a.veryShort){
    improvements.push("This answer is far too short to demonstrate your qualifications. Aim for a focused, substantive response rather than stopping after a few sentences.");
  } else if(a.short){
    improvements.push("This response is on the short side. Do not add filler—add evidence, action, and reflection.");
  }
  if(a.fillerCount>=3) improvements.push(`Your response contains ${a.fillerCount} filler/hedging instances (${a.fillerHits.join(", ")}). Practice pausing instead of filling silence.`);
  if(a.wpm>180) improvements.push(`Your estimated pace is ${a.wpm} WPM, which is very fast. Slow down; speed can make a good answer sound anxious or rehearsed.`);
  if(a.wpm>0&&a.wpm<75) improvements.push(`Your estimated pace is ${a.wpm} WPM. Make sure you are speaking with enough energy and detail.`);
  if(a.repeated.length>=3) improvements.push(`You repeated adjacent words ${a.repeated.length} times. Slow down and organize the next thought before speaking.`);
  if(a.offTopic) improvements.push("The response may be drifting away from the actual prompt. Listen for the question being asked and make your first sentence answer it.");
  if(a.red.length) critical.push("Potential interview red flags were detected. These matter more than minor delivery issues because professionalism and judgment are heavily scrutinized in medical-school interviews.");

  if(mode==="mmi"||mode==="ethics"){
    if(!a.stakeholders) improvements.push("For an MMI/ethics answer, identify who is affected. Name the relevant stakeholders before jumping to your conclusion.");
    if(!a.nuance) improvements.push("Your reasoning needs more nuance. Acknowledge competing values or information you would want before deciding.");
  }
  if(mode==="group"){
    improvements.push("In a real group interview, remember: contribute without dominating, build on others' ideas, and make room for quieter participants.");
  }
  if(mode==="panel"){
    improvements.push("In a panel, answer the person who asked the question while naturally including the other interviewers. If challenged, acknowledge the point before defending or revising your position.");
  }

  // Keep feedback concise enough to act on, but prioritize the biggest weaknesses.
  $("strengths").innerHTML=strengths.slice(0,5).map(x=>`<li>${x}</li>`).join("");
  $("improvements").innerHTML=improvements.slice(0,8).map(x=>`<li>${x}</li>`).join("");
  $("redFlags").innerHTML=(a.red.length?a.red:["No major red-flag phrases detected. This does NOT mean the answer is safe or strong; tone, judgment, and context cannot be fully assessed by this rule-based tool."]).map(x=>`<li>${x}</li>`).join("");

  $("delivery").innerHTML=`
    <p><b>${a.words.length}</b> words • estimated <b>${a.wpm||"—"} WPM</b></p>
    <p>Filler/hedging count: <b>${a.fillerCount}</b> • repeated-word pairs: <b>${a.repeated.length}</b></p>
    <p><b>Coach verdict:</b> ${critical.join(" ")}</p>`;

  let specific="";
  if(mode==="traditional") specific="Traditional interviews reward direct, specific, reflective answers. Do not assume the interviewer has read your application; make the story understandable without relying on your written materials.";
  if(mode==="behavioral") specific="Use a real story: situation → your actions → result → reflection. The biggest mistake is spending most of the answer describing the setting instead of what you did.";
  if(mode==="mmi") specific="MMI stations are about reasoning and communication, not finding a magic answer. Make your thought process visible, consider stakeholders, and stay calm when challenged.";
  if(mode==="ethics") specific="Avoid a snap judgment. Explain what information you would gather, which principles are competing, who is affected, and how you would communicate your decision.";
  if(mode==="group") specific="The target is neither “alpha” nor “sheep.” Show that you can contribute, listen, build on another person's point, disagree respectfully, and help the group move forward.";
  if(mode==="panel") specific="A panel can intentionally create pressure. Do not become defensive or feisty. Pause, acknowledge the challenge, then explain or revise your reasoning.";
  if(mode==="application") specific="Be ready to go deeper than your AMCAS wording. Know your exact role, a specific moment, the result, what surprised you, what you learned, and how the experience shaped your path to medicine.";
  $("specificFeedback").textContent=specific;

  const q=followUps[currentQuestion?.[0]]||pick([
    "Can you give me a specific example?",
    "What did YOU personally do in that situation?",
    "What was the outcome?",
    "What did you learn from that experience?",
    "How did that experience change the way you approach medicine?",
    "What would you do differently if you faced the situation again?"
  ]);
  $("followUp").innerHTML=`<p><b>Interviewer:</b> ${q}</p><p class="hint">If your answer was weak, do not memorize a prettier version. Try the question again using a specific story and reflection.</p>`;

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