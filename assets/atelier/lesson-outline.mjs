// Shared navigation contract for the interactive and JavaScript-free readers.
export function lessonOutline(l){
 return [['understand','Understand'],...(l.sections||[]).map((s,i)=>['section-'+i,s.title]),['steps','Step by step'],['example','Example'],...(l.worked?[['worked','Worked result']]:[]),['practice','Practice'],...(l.lab?[['lab','Run the lab']]:[]),['check','Check your result'],...(l.solution?[['solution','Answer & rubric']]:[]),['quiz','Knowledge check'],...(l.troubleshooting?[['troubleshooting','Troubleshooting']]:[]),['mistakes','Common mistakes'],['lesson-sources','Official sources']];
}
