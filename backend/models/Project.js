import mongoose from "mongoose";

// for message Schema 
const messageSchema=new mongoose.Schema({
    role:{
       type:String,
       enum:["user","assistant"],
       required:true
    },
    text:{
        type:String,
        required:true,
    },
},{
    id:false,
    timestamps:true
});

// for project schema 
const  projectSchema=new mongoose.Schema({
    

user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      default: "Untitled project",
      maxlength: 80,
    },
    prompt: { type: String, default: "" },
    enhancedPrompt: { type: String, default: "" },
    html: { type: String, default: "" },
    published: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date, default: null },
    messages: { type: [messageSchema], default: [] },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    viewedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      select: false,
    },
    likedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      select: false,
    },
    // For real Vercel deployments
    deployUrl: { type: String, default: "" },
    deployedAt: { type: Date, default: null },
},{
    timestamps:true
});
// to return project's full data 
projectSchema.methods.toClient=function(){
    return {
        id:this._id.toString(),
        name:this.name,
        prompt:this.prompt,
        enhancedPrompt:this.enhancedPrompt,
        html:this.html,
        published:this.published,
        publishedAt:this.publishedAt,
        message:this.message,
        views:this.views,
        likes:this.like,
        deployUrl:this.deployUrl,
        deployedAt:this.deployedAt,
        createdAt:this.createdAt
    };
};

// to return a trim public viewbb of the Project
projectSchema.methods.toPublicCard=function({withHtml=false}={}){
    const card={
        id:this._id.toString(),
        name:this.name,
        prompt:this.prompt,
        published:this.published,
        publishedAt:this.publishedAt,
        views:this.views,
        likes:this.like,
        author:
        this.populated("User") && this.user ?.name ?this.user.name:"Anonymous"

    };
    if(withHtml) card.html=this.html;
    return card;
};
export const Project =mongoose.model("Project",projectSchema);