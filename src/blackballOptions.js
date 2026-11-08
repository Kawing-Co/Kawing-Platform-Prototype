// Unpublished choices are explicit demo contracts; source base prices stay untouched.
const curated = new Set([2,7,10,14]);
export function withBlackballOptions(item) {
 if(!curated.has(item.id)||item.demoOptionsVersion)return item;
 // Leave merchant-authored size/topping contracts alone.
 if(item.options?.some(o=>['size','top'].includes(o.id)))return item;
 const options=[...(item.options||[]),
  {id:'size',label:'Size · demo',type:'single',default:'regular',choices:[{id:'regular',label:'Regular',delta:0,scale:1.06},{id:'large',label:'Large',delta:30,scale:1.22,note:'Demo option'}]},
  {id:'top',label:'Toppings · demo',type:'multi',choices:[{id:'cream',label:'Cream cap',delta:25,note:'Demo +₱25',fx:['#fb6301','#eee5d9']},{id:'syrup',label:'Caramel drizzle',delta:15,note:'Demo +₱15',fx:['#bf8443','#f5f2ec']}]}
 ];
 return {...item,options,demoOptionsVersion:1,images:{...item.images,rules:[{src:item.id===14?'seasalt-matcha':'seasalt-latte',when:{top:['cream']}},...(item.images?.rules||[])]}};
}
