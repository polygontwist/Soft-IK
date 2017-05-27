"use strict";

var ik=function(ziel_ID){
	var zielID=ziel_ID;
	var ziel;
	//---Helper---
	var cE=function(z,e,id){
			var l=document.createElement(e);
			if(id!="" && id!=undefined)l.id=id;
			if(z)z.appendChild(l);
			return l;
		}
	var gE=function(id){
		var re=undefined;
		if(id=="")return re;
		
		re=document.getElementById(id);
		if(re==null)re=undefined;
		return re;
	}

	var addClass=function(o,s){	
		var s2;
		if(o!=undefined){
			s2=o.className;
			if(s2==undefined)s2="";
			if(s2.indexOf(s)<0)o.className=s2+' '+s;	
		}			
	}
	var subClass=function(o,s){
		var s2;
		if(o!=undefined){
			s2=o.className;
			s2=s2.split('  ').join(' ');
			if(s2.indexOf(s)>-1)o.className=s2.split(' '+s).join('');
			if(s2.indexOf(s)>-1)o.className=s2.split(s).join('');
		}
	}
	var delClass=function(o){
		if(o!=undefined) o.className="";		
	}
	var getClass=function(o){return o.className;}
	var istClass=function(o,s){
			if(o.className)
				return (o.className.indexOf(s)>-1);
				else
				return false;
			}
	
	
	
	var setWBXY=function(o){
		o.o.style.left=o.x+"px";
		o.o.style.top=o.y+"px";
		o.o.style.width=o.b+"px";
		o.o.style.height=o.h+"px";		
	}
	var setXY=function(o,x,y){if(isNaN(x))return;
		o.o.style.left=x+"px";
		o.o.style.top=y+"px";
		o.x=x;
		o.y=y;
	}
	var rotate=function(o,deg,mitLimit){
		if(isNaN(deg))
		{
			//console.log(o,deg)
			return;
		}
		
		if(mitLimit && o.limitrot){
			if(deg<o.limitrot.min)deg=o.limitrot.min;
			if(deg>o.limitrot.max)deg=o.limitrot.max;
		}
		o.o.style.transform="rotate("+deg+"deg)";
		o.r=deg;
	}
	
	var streckenlaenge2D=function(p1,p2) {//[x,y][x,y]
		return Math.sqrt( Math.pow(p2[1]-p1[1],2)+Math.pow(p2[0]-p1[0],2));
	} 
	var getWinkel=function(p0,p1,p2 ,rkorr){//[x,y][x,y][x,y]
		//Winkel Strecke p0-p1 zu p1-p2 in Grad
		var re=0;
		var a=streckenlaenge2D(p1,p2);
		var b=streckenlaenge2D(p0,p2);
		var c=streckenlaenge2D(p0,p1);	
		if(a>0 && b>0 && c>0)
			re=Math.acos((a*a+c*c-b*b)/(2*a*c))* 180/Math.PI;
		
		if(rkorr)if(p1[0]<p2[0])re=re*-1;
		
		return re;
	}
	
	
	var arme=[
		{
			oarm:{o:0,x:150,y:150,b:20,h:150,r:0,limitrot:{max:80, min:-80}},
			uarm:{o:0,x:0,y:140,b:20,h:80,r:0,limitrot:{max:80, min:-80}},
			hand:{o:0,x:0,y:70,b:20,h:30,r:0,limitrot:{max:80, min:-80}},
			basisoarm:{o:0,x:0,y:0,b:20,h:20,aktiv:false},	
			ellenbogen:{o:0,x:0,y:0,b:10,h:10},		
			zielhand:{o:0,x:140,y:300,b:20,h:20,aktiv:false}		
		},
		{
			oarm:{o:0,x:325,y:150,b:20,h:110,r:0,limitrot:{max:80, min:-80}},
			uarm:{o:0,x:0,y:100,b:20,h:110,r:0,limitrot:{max:80, min:-80}},
			hand:{o:0,x:0,y:100,b:20,h:20,r:0,limitrot:{max:80, min:-80}},
			basisoarm:{o:0,x:0,y:0,b:20,h:20,aktiv:false},
			ellenbogen:{o:0,x:0,y:0,b:10,h:10},		
			zielhand:{o:0,x:315,y:300,b:20,h:20,aktiv:false}		
		},
		{
			oarm:{o:0,x:500,y:150,b:20,h:80,r:0,limitrot:{max:80, min:-80}},
			uarm:{o:0,x:0,y:70,b:20,h:110,r:0,limitrot:{max:80, min:-80}},
			hand:{o:0,x:0,y:100,b:20,h:20,r:0,limitrot:{max:80, min:-80}},
			basisoarm:{o:0,x:0,y:0,b:20,h:20,aktiv:false},
			ellenbogen:{o:0,x:0,y:0,b:10,h:10},		
			zielhand:{o:0,x:490,y:300,b:20,h:20,aktiv:false}		
		}
	];
	
	
	
	function drehePunkt(p, dreheumPunkt, Winkel){
		var r=Winkel*Math.PI/180;//Winkel in Bogenmaß
		var re=[0,0];
		var flength = Math.sqrt( Math.pow(dreheumPunkt[1]-p[1],2)+Math.pow(dreheumPunkt[0]-p[0],2));
		var angle = r+Math.atan2(p[1]-dreheumPunkt[1],p[0]-dreheumPunkt[0]);
		while(angle<0){angle = angle+2*Math.PI;}
		while(angle>2*Math.PI){angle = angle-2*Math.PI;}
		re[0]= dreheumPunkt[0]+Math.cos(angle)*flength;
		re[1]= dreheumPunkt[1]+Math.sin(angle)*flength;
		return re;
	}
	
	var stretchTo=function(the_arm, mx,my){
		var w1=0,w2=0;
		var p2xy,wp2,wpM,wp1;
		
		var p1x=the_arm.oarm.x+the_arm.oarm.b*0.5;//Drehpunk liegt +50% breite
		var p1y=the_arm.oarm.y;
		
		var a=streckenlaenge2D([p1x,p1y],[mx,my]); //P1Maus
		var b=the_arm.uarm.y;//weil verschachtelt  //P1P2
		var c=the_arm.hand.y;					   //P2Maus
		
		if(a>=(c+b)){//gestreckt
			w1=getWinkel([p1x,p1y+20],[p1x,p1y], [mx,my],true);
			rotate(the_arm.oarm,w1,false);
			rotate(the_arm.uarm,w2,false);
			rotate(the_arm.hand,90-w1,false);
			
			p2xy =drehePunkt([p1x+the_arm.uarm.x,p1y+the_arm.uarm.y],[p1x,p1y],the_arm.oarm.r);
			setXY(the_arm.ellenbogen,p2xy[0]-the_arm.ellenbogen.o.offsetWidth*0.5,p2xy[1]-the_arm.ellenbogen.o.offsetHeight*0.5);//g
			
			
			console.log(w1,w2)
			
		}
		if(a<(b-c) || a<(c-b)){
			w1=getWinkel([p1x,p1y+20],[p1x,p1y], [mx,my],true);
			rotate(the_arm.oarm,w1,false);
			//rotate(the_arm.uarm,w2,false);
			rotate(the_arm.hand,90-w1-the_arm.uarm.r,false);
			
			p2xy =drehePunkt([p1x+the_arm.uarm.x,p1y+the_arm.uarm.y],[p1x,p1y],the_arm.oarm.r);
			setXY(the_arm.ellenbogen,p2xy[0]-the_arm.ellenbogen.o.offsetWidth*0.5,p2xy[1]-the_arm.ellenbogen.o.offsetHeight*0.5);//g
		}		
		else{
			wp2 = 180/Math.PI*Math.acos((b*b-(-c*c)-a*a)/(2*b*c));//alpha (P2)
			wpM = 180/Math.PI*Math.acos((a*a-(-c*c)-b*b)/(2*a*c));//beta (Maus)
			wp1 = 180/Math.PI*Math.acos((a*a-(-b*b)-c*c)/(2*a*b));//gamma (P1)

			//w1=180-wp1-90-(getWinkel([p1x-20,p1y],[p1x,p1y], [mx,my],false));
			var ws=getWinkel([mx,my],[p1x,p1y], [p1x,p1y+20] ,false);//maus p1 p1senkrechte
			if(mx>p1x){ws=ws*-1}
			w1=ws-wp1;
			rotate(the_arm.oarm,w1,false);
				
			p2xy =drehePunkt([p1x+the_arm.uarm.x,p1y+the_arm.uarm.y],[p1x,p1y],the_arm.oarm.r);
			setXY(the_arm.ellenbogen,p2xy[0]-the_arm.ellenbogen.o.offsetWidth*0.5,p2xy[1]-the_arm.ellenbogen.o.offsetHeight*0.5);//g
			
			if(w1==the_arm.oarm.r){//ohne Beschränkung
				w2=180-wp2;			
				rotate(the_arm.uarm,w2,false);
				rotate(the_arm.hand,90-w2-w1,false);
			}else{//mit Beschränkung
				c=streckenlaenge2D(p2xy,[mx,my]);
				wp2 = 180/Math.PI*Math.acos((b*b-(-c*c)-a*a)/(2*b*c));//alpha (P2)
				w2=180-wp2;
				rotate(the_arm.uarm,w2,false);
			}
		}
	};
	
	var stretchen=function(the_arm,mx,my){
		if(the_arm.zielhand.aktiv){
			setXY(the_arm.zielhand,mx-the_arm.zielhand.o.offsetWidth*0.5,my-the_arm.zielhand.o.offsetHeight*0.5);
		}
		else{
			
		}	
		if(the_arm.basisoarm.aktiv){
			setXY(the_arm.basisoarm,mx-the_arm.basisoarm.o.offsetWidth*0.5,my-the_arm.basisoarm.o.offsetHeight*0.5);
			setXY(the_arm.oarm,mx-the_arm.basisoarm.o.offsetWidth*0.5,my);
		}
		else
			setXY(the_arm.basisoarm,the_arm.oarm.x,the_arm.oarm.y-10);
		
		if(the_arm.zielhand.aktiv || the_arm.basisoarm.aktiv){
			stretchTo(the_arm,the_arm.zielhand.x+the_arm.zielhand.o.offsetWidth*0.5,the_arm.zielhand.y+the_arm.zielhand.o.offsetHeight*0.5);
		}		
	}
	
	var armaktiv=undefined;
	var maus=function(e){
		var mx;
		var my;
		if (e.pageX || e.pageY) { 
		  mx = e.pageX;
		  my = e.pageY;
		}
		else { 
		  mx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
		  my = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
		} 
		
		//Koordinaten relativ zum Mutterelement:
		var p=this;
		while(p){
			mx=mx-p.offsetLeft;
			my=my-p.offsetTop;			
			p=p.parent;
		}
		
		if(armaktiv)
			stretchen(armaktiv,mx,my);
		return true;	
	}
	
	var createArm=function(ziel,thearm){
		thearm.oarm.o=cE(ziel,"div");
		setWBXY(thearm.oarm);
		thearm.oarm.limitrot={max:60, min:-60};
		
		thearm.uarm.o=cE(thearm.oarm.o,"div");
		setWBXY(thearm.uarm);
		thearm.uarm.limitrot={max:100, min:-100};
		
		thearm.hand.o=cE(thearm.uarm.o,"div");
		setWBXY(thearm.hand);
		thearm.hand.limitrot={max:90, min:-90};
		
		rotate(thearm.oarm,-5);
		rotate(thearm.uarm,-5);
		rotate(thearm.hand,-5);
		
		thearm.zielhand.o=cE(ziel,"span");
		setWBXY(thearm.zielhand);
		thearm.zielhand.o.thearm=thearm;
		thearm.zielhand.o.data=thearm.zielhand;
		thearm.zielhand.o.onmousedown=function(){armaktiv=this.thearm;this.data.aktiv=true;};
		thearm.zielhand.o.onmouseup=function(){this.data.aktiv=false;};
		
		thearm.basisoarm.o=cE(ziel,"span");
		setWBXY(thearm.basisoarm);
		thearm.basisoarm.o.thearm=thearm;
		thearm.basisoarm.o.data=thearm.basisoarm;
		thearm.basisoarm.o.onmousedown=function(){armaktiv=this.thearm;this.data.aktiv=true;};
		thearm.basisoarm.o.onmouseup=function(){this.data.aktiv=false;};
		
		thearm.ellenbogen.o=cE(ziel,"span");
		setWBXY(thearm.ellenbogen);
		thearm.ellenbogen.o.style.backgroundColor="rgba(0,255,0,0.5)";
		
		thearm.basisoarm.aktiv=true;
		stretchen(thearm,thearm.oarm.x,thearm.oarm.y);
		thearm.basisoarm.aktiv=false;		
	}
	
	
	this.ini=function(){
		ziel=gE(ziel_ID);
		for(var i=0;i<arme.length;i++){
			createArm(ziel,arme[i]);
		}
		
		ziel.onmousemove=maus;
		ziel.onmouseup=function(){
			for(var i=0;i<arme.length;i++){
				arme[i].basisoarm.aktiv=false;
				arme[i].zielhand.aktiv=false;
			}
		};
		
	}		
}



window.onload=function(){			
	var gb=new ik("gbh5");
	gb.ini();
};