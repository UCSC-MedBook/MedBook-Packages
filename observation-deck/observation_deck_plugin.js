this.j$=this.jStat=function(a,b){function f(b,c){var d=b>c?b:c;return a.pow(10,17-~~(a.log(d>0?d:-d)*a.LOG10E))}function h(a){return e.call(a)==="[object Function]"}function i(a){return typeof a=="number"&&a===a}function j(a){return c.apply([],a)}function k(){return new k._init(arguments)}function l(){return 0}function m(){return 1}function n(a,b){return a===b?1:0}var c=Array.prototype.concat,d=Array.prototype.slice,e=Object.prototype.toString,g=Array.isArray||function(b){return e.call(b)==="[object Array]"};k.fn=k.prototype,k._init=function(b){var c;if(g(b[0]))if(g(b[0][0])){h(b[1])&&(b[0]=k.map(b[0],b[1]));for(c=0;c<b[0].length;c++)this[c]=b[0][c];this.length=b[0].length}else this[0]=h(b[1])?k.map(b[0],b[1]):b[0],this.length=1;else if(i(b[0]))this[0]=k.seq.apply(null,b),this.length=1;else{if(b[0]instanceof k)return k(b[0].toArray());this[0]=[],this.length=1}return this},k._init.prototype=k.prototype,k._init.constructor=k,k.utils={calcRdx:f,isArray:g,isFunction:h,isNumber:i,toVector:j},k.extend=function(b){var c,d;if(arguments.length===1){for(d in b)k[d]=b[d];return this}for(c=1;c<arguments.length;c++)for(d in arguments[c])b[d]=arguments[c][d];return b},k.rows=function(b){return b.length||1},k.cols=function(b){return b[0].length||1},k.dimensions=function(b){return{rows:k.rows(b),cols:k.cols(b)}},k.row=function(b,c){return b[c]},k.col=function(b,c){var d=new Array(b.length);for(var e=0;e<b.length;e++)d[e]=[b[e][c]];return d},k.diag=function(b){var c=k.rows(b),d=new Array(c);for(var e=0;e<c;e++)d[e]=[b[e][e]];return d},k.antidiag=function(b){var c=k.rows(b)-1,d=new Array(c);for(var e=0;c>=0;c--,e++)d[e]=[b[e][c]];return d},k.transpose=function(b){var c=[],d,e,f,h,i;g(b[0])||(b=[b]),e=b.length,f=b[0].length;for(i=0;i<f;i++){d=new Array(e);for(h=0;h<e;h++)d[h]=b[h][i];c.push(d)}return c.length===1?c[0]:c},k.map=function(b,c,d){var e,f,h,i,j;g(b[0])||(b=[b]),f=b.length,h=b[0].length,i=d?b:new Array(f);for(e=0;e<f;e++){i[e]||(i[e]=new Array(h));for(j=0;j<h;j++)i[e][j]=c(b[e][j],e,j)}return i.length===1?i[0]:i},k.cumreduce=function(b,c,d){var e,f,h,i,j;g(b[0])||(b=[b]),f=b.length,h=b[0].length,i=d?b:new Array(f);for(e=0;e<f;e++){i[e]||(i[e]=new Array(h)),h>0&&(i[e][0]=b[e][0]);for(j=1;j<h;j++)i[e][j]=c(i[e][j-1],b[e][j])}return i.length===1?i[0]:i},k.alter=function(b,c){return k.map(b,c,!0)},k.create=function(b,c,d){var e=new Array(b),f,g;h(c)&&(d=c,c=b);for(f=0;f<b;f++){e[f]=new Array(c);for(g=0;g<c;g++)e[f][g]=d(f,g)}return e},k.zeros=function(b,c){return i(c)||(c=b),k.create(b,c,l)},k.ones=function(b,c){return i(c)||(c=b),k.create(b,c,m)},k.rand=function(c,d){return i(d)||(d=c),k.create(c,d,a.random)},k.identity=function(b,c){return i(c)||(c=b),k.create(b,c,n)},k.symmetric=function(b){var c=!0,d=b.length,e,f;if(b.length!==b[0].length)return!1;for(e=0;e<d;e++)for(f=0;f<d;f++)if(b[f][e]!==b[e][f])return!1;return!0},k.clear=function(b){return k.alter(b,l)},k.seq=function(b,c,d,e){h(e)||(e=!1);var g=[],i=f(b,c),j=(c*i-b*i)/((d-1)*i),k=b,l;for(l=0;k<=c;l++,k=(b*i+j*i*l)/i)g.push(e?e(k,l):k);return g};var o=k.prototype;return o.length=0,o.push=Array.prototype.push,o.sort=Array.prototype.sort,o.splice=Array.prototype.splice,o.slice=Array.prototype.slice,o.toArray=function(){return this.length>1?d.call(this):d.call(this)[0]},o.map=function(b,c){return k(k.map(this,b,c))},o.cumreduce=function(b,c){return k(k.cumreduce(this,b,c))},o.alter=function(b){return k.alter(this,b),this},function(a){for(var b=0;b<a.length;b++)(function(a){o[a]=function(b){var c=this,d;return b?(setTimeout(function(){b.call(c,o[a].call(c))}),this):(d=k[a](this),g(d)?k(d):d)}})(a[b])}("transpose clear symmetric rows cols dimensions diag antidiag".split(" ")),function(a){for(var b=0;b<a.length;b++)(function(a){o[a]=function(b,c){var d=this;return c?(setTimeout(function(){c.call(d,o[a].call(d,b))}),this):k(k[a](this,b))}})(a[b])}("row col".split(" ")),function(a){for(var b=0;b<a.length;b++)(function(a){o[a]=new Function("return jStat(jStat."+a+".apply(null, arguments));")})(a[b])}("create zeros ones rand identity".split(" ")),k}(Math),function(a,b){function d(a,b){return a-b}function e(a,c,d){return b.max(c,b.min(a,d))}var c=a.utils.isFunction;a.sum=function g(a){var g=0,b=a.length,c;while(--b>=0)g+=a[b];return g},a.sumsqrd=function(b){var c=0,d=b.length;while(--d>=0)c+=b[d]*b[d];return c},a.sumsqerr=function(c){var d=a.mean(c),e=0,f=c.length,g;while(--f>=0)g=c[f]-d,e+=g*g;return e},a.product=function(b){var c=1,d=b.length;while(--d>=0)c*=b[d];return c},a.min=function(b){var c=b[0],d=0;while(++d<b.length)b[d]<c&&(c=b[d]);return c},a.max=function(b){var c=b[0],d=0;while(++d<b.length)b[d]>c&&(c=b[d]);return c},a.mean=function(c){return a.sum(c)/c.length},a.meansqerr=function(c){return a.sumsqerr(c)/c.length},a.geomean=function(d){return b.pow(a.product(d),1/d.length)},a.median=function(b){var c=b.length,e=b.slice().sort(d);return c&1?e[c/2|0]:(e[c/2-1]+e[c/2])/2},a.cumsum=function(c){return a.cumreduce(c,function(a,b){return a+b})},a.cumprod=function(c){return a.cumreduce(c,function(a,b){return a*b})},a.diff=function(b){var c=[],d=b.length,e;for(e=1;e<d;e++)c.push(b[e]-b[e-1]);return c},a.mode=function(b){var c=b.length,e=b.slice().sort(d),f=1,g=0,h=0,i=[],j;for(j=0;j<c;j++)e[j]===e[j+1]?f++:(f>g?(i=[e[j]],g=f,h=0):f===g&&(i.push(e[j]),h++),f=1);return h===0?i[0]:i},a.range=function(c){return a.max(c)-a.min(c)},a.variance=function(c,d){return a.sumsqerr(c)/(c.length-(d?1:0))},a.stdev=function(d,e){return b.sqrt(a.variance(d,e))},a.meandev=function(d){var e=0,f=a.mean(d),g;for(g=d.length-1;g>=0;g--)e+=b.abs(d[g]-f);return e/d.length},a.meddev=function(d){var e=0,f=a.median(d),g;for(g=d.length-1;g>=0;g--)e+=b.abs(d[g]-f);return e/d.length},a.coeffvar=function(c){return a.stdev(c)/a.mean(c)},a.quartiles=function(c){var e=c.length,f=c.slice().sort(d);return[f[b.round(e/4)-1],f[b.round(e/2)-1],f[b.round(e*3/4)-1]]},a.quantiles=function(c,f,g,h){var i=c.slice().sort(d),j=[f.length],k=c.length,l,m,n,o,p,q;typeof g=="undefined"&&(g=3/8),typeof h=="undefined"&&(h=3/8);for(l=0;l<f.length;l++)m=f[l],n=g+m*(1-g-h),o=k*m+n,p=b.floor(e(o,1,k-1)),q=e(o-p,0,1),j[l]=(1-q)*i[p-1]+q*i[p];return j},a.percentileOfScore=function(b,c,d){var e=0,f=b.length,g=!1,h,i;d==="strict"&&(g=!0);for(i=0;i<f;i++)h=b[i],(g&&h<c||!g&&h<=c)&&e++;return e/f},a.histogram=function(d,e){var f=a.min(d),g=e||4,h=(a.max(d)-f)/g,i=d.length,e=[],j;for(j=0;j<g;j++)e[j]=0;for(j=0;j<i;j++)e[b.min(b.floor((d[j]-f)/h),g-1)]+=1;return e},a.covariance=function(c,d){var e=a.mean(c),f=a.mean(d),g=c.length,h=new Array(g),i;for(i=0;i<g;i++)h[i]=(c[i]-e)*(d[i]-f);return a.sum(h)/(g-1)},a.corrcoeff=function(c,d){return a.covariance(c,d)/a.stdev(c,1)/a.stdev(d,1)},a.stanMoment=function(d,e){var f=a.mean(d),g=a.stdev(d),h=d.length,j=0;for(i=0;i<h;i++)j+=b.pow((d[i]-f)/g,e);return j/d.length},a.skewness=function(c){return a.stanMoment(c,3)},a.kurtosis=function(c){return a.stanMoment(c,4)-3};var f=a.prototype;(function(b){for(var d=0;d<b.length;d++)(function(b){f[b]=function(d,e){var g=[],h=0,i=this;c(d)&&(e=d,d=!1);if(e)return setTimeout(function(){e.call(i,f[b].call(i,d))}),this;if(this.length>1){i=d===!0?this:this.transpose();for(;h<i.length;h++)g[h]=a[b](i[h]);return g}return a[b](this[0],d)}})(b[d])})("cumsum cumprod".split(" ")),function(b){for(var d=0;d<b.length;d++)(function(b){f[b]=function(d,e){var g=[],h=0,i=this;c(d)&&(e=d,d=!1);if(e)return setTimeout(function(){e.call(i,f[b].call(i,d))}),this;if(this.length>1){i=d===!0?this:this.transpose();for(;h<i.length;h++)g[h]=a[b](i[h]);return d===!0?a[b](a.utils.toVector(g)):g}return a[b](this[0],d)}})(b[d])}("sum sumsqrd sumsqerr product min max mean meansqerr geomean median diff mode range variance stdev meandev meddev coeffvar quartiles histogram skewness kurtosis".split(" ")),function(b){for(var d=0;d<b.length;d++)(function(b){f[b]=function(){var d=[],e=0,g=this,h=Array.prototype.slice.call(arguments);if(c(h[h.length-1])){var i=h[h.length-1],j=h.slice(0,h.length-1);return setTimeout(function(){i.call(g,f[b].apply(g,j))}),this}var i=undefined,k=function(d){return a[b].apply(g,[d].concat(h))};if(this.length>1){g=g.transpose();for(;e<g.length;e++)d[e]=k(g[e]);return d}return k(this[0])}})(b[d])}("quantiles percentileOfScore".split(" "))}(this.jStat,Math),function(a,b){a.gammaln=function(c){var d=0,e=[76.18009172947146,-86.50532032941678,24.01409824083091,-1.231739572450155,.001208650973866179,-0.000005395239384953],f=1.000000000190015,g,h,i;i=(h=g=c)+5.5,i-=(g+.5)*b.log(i);for(;d<6;d++)f+=e[d]/++h;return b.log(2.5066282746310007*f/g)-i},a.gammafn=function(c){var d=[-1.716185138865495,24.76565080557592,-379.80425647094563,629.3311553128184,866.9662027904133,-31451.272968848367,-36144.413418691176,66456.14382024054],e=[-30.8402300119739,315.35062697960416,-1015.1563674902192,-3107.771671572311,22538.11842098015,4755.846277527881,-134659.9598649693,-115132.2596755535],f=!1,g=0,h=0,i=0,j=c,k,l,m,n,o,p;if(j<=0){n=j%1+3.6e-16;if(n)f=(j&1?-1:1)*b.PI/b.sin(b.PI*n),j=1-j;else return Infinity}m=j,j<1?l=j++:l=(j-=g=(j|0)-1)-1;for(k=0;k<8;++k)i=(i+d[k])*l,h=h*l+e[k];n=i/h+1;if(m<j)n/=m;else if(m>j)for(k=0;k<g;++k)n*=j,j++;return f&&(n=f/n),n},a.gammap=function(d,e){var f=a.gammaln(d),g=d,h=1/d,i=h,j=e+1-d,k=1/1e-30,l=1/j,m=l,n=1,o=-~(b.log(d>=1?d:1/d)*8.5+d*.4+17),p,q;if(e<0||d<=0)return NaN;if(e<d+1){for(;n<=o;n++)h+=i*=e/++g;return h*b.exp(-e+d*b.log(e)-f)}for(;n<=o;n++)p=-n*(n-d),j+=2,l=p*l+j,k=j+p/k,l=1/l,m*=l*k;return 1-m*b.exp(-e+d*b.log(e)-f)},a.factorialln=function(c){return c<0?NaN:a.gammaln(c+1)},a.factorial=function(c){return c<0?NaN:a.gammafn(c+1)},a.combination=function(d,e){return d>170||e>170?b.exp(a.combinationln(d,e)):a.factorial(d)/a.factorial(e)/a.factorial(d-e)},a.combinationln=function(c,d){return a.factorialln(c)-a.factorialln(d)-a.factorialln(c-d)},a.permutation=function(c,d){return a.factorial(c)/a.factorial(c-d)},a.betafn=function(d,e){return d<=0||e<=0?undefined:d+e>170?b.exp(a.betaln(d,e)):a.gammafn(d)*a.gammafn(e)/a.gammafn(d+e)},a.betaln=function(c,d){return a.gammaln(c)+a.gammaln(d)-a.gammaln(c+d)},a.betacf=function(c,d,e){var f=1e-30,g=1,h=d+e,i=d+1,j=d-1,k=1,l=1-h*c/i,m,n,o,p;b.abs(l)<f&&(l=f),l=1/l,p=l;for(;g<=100;g++){m=2*g,n=g*(e-g)*c/((j+m)*(d+m)),l=1+n*l,b.abs(l)<f&&(l=f),k=1+n/k,b.abs(k)<f&&(k=f),l=1/l,p*=l*k,n=-(d+g)*(h+g)*c/((d+m)*(i+m)),l=1+n*l,b.abs(l)<f&&(l=f),k=1+n/k,b.abs(k)<f&&(k=f),l=1/l,o=l*k,p*=o;if(b.abs(o-1)<3e-7)break}return p},a.gammapinv=function(d,e){var f=0,g=e-1,h=1e-8,i=a.gammaln(e),j,k,l,m,n,o,p;if(d>=1)return b.max(100,e+100*b.sqrt(e));if(d<=0)return 0;e>1?(o=b.log(g),p=b.exp(g*(o-1)-i),n=d<.5?d:1-d,l=b.sqrt(-2*b.log(n)),j=(2.30753+l*.27061)/(1+l*(.99229+l*.04481))-l,d<.5&&(j=-j),j=b.max(.001,e*b.pow(1-1/(9*e)-j/(3*b.sqrt(e)),3))):(l=1-e*(.253+e*.12),d<l?j=b.pow(d/l,1/e):j=1-b.log(1-(d-l)/(1-l)));for(;f<12;f++){if(j<=0)return 0;k=a.gammap(e,j)-d,e>1?l=p*b.exp(-(j-g)+g*(b.log(j)-o)):l=b.exp(-j+g*b.log(j)-i),m=k/l,j-=l=m/(1-.5*b.min(1,m*((e-1)/j-1))),j<=0&&(j=.5*(j+l));if(b.abs(l)<h*j)break}return j},a.erf=function(c){var d=[-1.3026537197817094,.6419697923564902,.019476473204185836,-0.00956151478680863,-0.000946595344482036,.000366839497852761,42523324806907e-18,-0.000020278578112534,-0.000001624290004647,130365583558e-17,1.5626441722e-8,-8.5238095915e-8,6.529054439e-9,5.059343495e-9,-9.91364156e-10,-2.27365122e-10,9.6467911e-11,2.394038e-12,-6.886027e-12,8.94487e-13,3.13092e-13,-1.12708e-13,3.81e-16,7.106e-15,-1.523e-15,-9.4e-17,1.21e-16,-2.8e-17],e=d.length-1,f=!1,g=0,h=0,i,j,k,l;c<0&&(c=-c,f=!0),i=2/(2+c),j=4*i-2;for(;e>0;e--)k=g,g=j*g-h+d[e],h=k;return l=i*b.exp(-c*c+.5*(d[0]+j*g)-h),f?l-1:1-l},a.erfc=function(c){return 1-a.erf(c)},a.erfcinv=function(d){var e=0,f,g,h,i;if(d>=2)return-100;if(d<=0)return 100;i=d<1?d:2-d,h=b.sqrt(-2*b.log(i/2)),f=-0.70711*((2.30753+h*.27061)/(1+h*(.99229+h*.04481))-h);for(;e<2;e++)g=a.erfc(f)-i,f+=g/(1.1283791670955126*b.exp(-f*f)-f*g);return d<1?f:-f},a.ibetainv=function(d,e,f){var g=1e-8,h=e-1,i=f-1,j=0,k,l,m,n,o,p,q,r,s,t,u;if(d<=0)return 0;if(d>=1)return 1;e>=1&&f>=1?(m=d<.5?d:1-d,n=b.sqrt(-2*b.log(m)),q=(2.30753+n*.27061)/(1+n*(.99229+n*.04481))-n,d<.5&&(q=-q),r=(q*q-3)/6,s=2/(1/(2*e-1)+1/(2*f-1)),t=q*b.sqrt(r+s)/s-(1/(2*f-1)-1/(2*e-1))*(r+5/6-2/(3*s)),q=e/(e+f*b.exp(2*t))):(k=b.log(e/(e+f)),l=b.log(f/(e+f)),n=b.exp(e*k)/e,o=b.exp(f*l)/f,t=n+o,d<n/t?q=b.pow(e*t*d,1/e):q=1-b.pow(f*t*(1-d),1/f)),u=-a.gammaln(e)-a.gammaln(f)+a.gammaln(e+f);for(;j<10;j++){if(q===0||q===1)return q;p=a.ibeta(q,e,f)-d,n=b.exp(h*b.log(q)+i*b.log(1-q)+u),o=p/n,q-=n=o/(1-.5*b.min(1,o*(h/q-i/(1-q)))),q<=0&&(q=.5*(q+n)),q>=1&&(q=.5*(q+n+1));if(b.abs(n)<g*q&&j>0)break}return q},a.ibeta=function(d,e,f){var g=d===0||d===1?0:b.exp(a.gammaln(e+f)-a.gammaln(e)-a.gammaln(f)+e*b.log(d)+f*b.log(1-d));return d<0||d>1?!1:d<(e+1)/(e+f+2)?g*a.betacf(d,e,f)/e:1-g*a.betacf(1-d,f,e)/f},a.randn=function(d,e){var f,g,h,i,j,k;e||(e=d);if(d)return a.create(d,e,function(){return a.randn()});do f=b.random(),g=1.7156*(b.random()-.5),h=f-.449871,i=b.abs(g)+.386595,j=h*h+i*(.196*i-.25472*h);while(j>.27597&&(j>.27846||g*g>-4*b.log(f)*f*f));return g/f},a.randg=function(d,e,f){var g=d,h,i,j,k,l,m;f||(f=e),d||(d=1);if(e)return m=a.zeros(e,f),m.alter(function(){return a.randg(d)}),m;d<1&&(d+=1),h=d-1/3,i=1/b.sqrt(9*h);do{do l=a.randn(),k=1+i*l;while(k<=0);k=k*k*k,j=b.random()}while(j>1-.331*b.pow(l,4)&&b.log(j)>.5*l*l+h*(1-k+b.log(k)));if(d==g)return h*k;do j=b.random();while(j===0);return b.pow(j,1/g)*h*k},function(b){for(var c=0;c<b.length;c++)(function(b){a.fn[b]=function(){return a(a.map(this,function(c){return a[b](c)}))}})(b[c])}("gammaln gammafn factorial factorialln".split(" ")),function(b){for(var c=0;c<b.length;c++)(function(b){a.fn[b]=function(){return a(a[b].apply(null,arguments))}})(b[c])}("randn".split(" "))}(this.jStat,Math),function(a,b){(function(b){for(var c=0;c<b.length;c++)(function(b){a[b]=function(a,b,c){return this instanceof arguments.callee?(this._a=a,this._b=b,this._c=c,this):new arguments.callee(a,b,c)},a.fn[b]=function(c,d,e){var f=a[b](c,d,e);return f.data=this,f},a[b].prototype.sample=function(c){var d=this._a,e=this._b,f=this._c;return c?a.alter(c,function(){return a[b].sample(d,e,f)}):a[b].sample(d,e,f)},function(c){for(var d=0;d<c.length;d++)(function(c){a[b].prototype[c]=function(d){var e=this._a,f=this._b,g=this._c;return!d&&d!==0&&(d=this.data),typeof d!="number"?a.fn.map.call(d,function(d){return a[b][c](d,e,f,g)}):a[b][c](d,e,f,g)}})(c[d])}("pdf cdf inv".split(" ")),function(c){for(var d=0;d<c.length;d++)(function(c){a[b].prototype[c]=function(){return a[b][c](this._a,this._b,this._c)}})(c[d])}("mean median mode variance".split(" "))})(b[c])})("beta centralF cauchy chisquare exponential gamma invgamma kumaraswamy lognormal normal pareto studentt weibull uniform  binomial negbin hypgeom poisson triangular".split(" ")),a.extend(a.beta,{pdf:function(d,e,f){return d>1||d<0?0:e==1&&f==1?1:e<512||f<512?b.pow(d,e-1)*b.pow(1-d,f-1)/a.betafn(e,f):b.exp((e-1)*b.log(d)+(f-1)*b.log(1-d)-a.betaln(e,f))},cdf:function(c,d,e){return c>1||c<0?(c>1)*1:a.ibeta(c,d,e)},inv:function(c,d,e){return a.ibetainv(c,d,e)},mean:function(b,c){return b/(b+c)},median:function(b,c){throw new Error("median not yet implemented")},mode:function(c,d){return c*d/(b.pow(c+d,2)*(c+d+1))},sample:function(c,d){var e=a.randg(c);return e/(e+a.randg(d))},variance:function(c,d){return c*d/(b.pow(c+d,2)*(c+d+1))}}),a.extend(a.centralF,{pdf:function(d,e,f){var g,h,i;return d<0?undefined:e<=2?b.sqrt(b.pow(e*d,e)*b.pow(f,f)/b.pow(e*d+f,e+f))/(d*a.betafn(e/2,f/2)):(g=e*d/(f+d*e),h=f/(f+d*e),i=e*h/2,i*a.binomial.pdf((e-2)/2,(e+f-2)/2,g))},cdf:function(c,d,e){return a.ibeta(d*c/(d*c+e),d/2,e/2)},inv:function(c,d,e){return e/(d*(1/a.ibetainv(c,d/2,e/2)-1))},mean:function(b,c){return c>2?c/(c-2):undefined},mode:function(b,c){return b>2?c*(b-2)/(b*(c+2)):undefined},sample:function(c,d){var e=a.randg(c/2)*2,f=a.randg(d/2)*2;return e/c/(f/d)},variance:function(b,c){return c<=4?undefined:2*c*c*(b+c-2)/(b*(c-2)*(c-2)*(c-4))}}),a.extend(a.cauchy,{pdf:function(c,d,e){return e/(b.pow(c-d,2)+b.pow(e,2))/b.PI},cdf:function(c,d,e){return b.atan((c-d)/e)/b.PI+.5},inv:function(a,c,d){return c+d*b.tan(b.PI*(a-.5))},median:function(b,c){return b},mode:function(b,c){return b},sample:function(d,e){return a.randn()*b.sqrt(1/(2*a.randg(.5)))*e+d}}),a.extend(a.chisquare,{pdf:function(d,e){return d===0?0:b.exp((e/2-1)*b.log(d)-d/2-e/2*b.log(2)-a.gammaln(e/2))},cdf:function(c,d){return a.gammap(d/2,c/2)},inv:function(b,c){return 2*a.gammapinv(b,.5*c)},mean:function(a){return a},median:function(c){return c*b.pow(1-2/(9*c),3)},mode:function(b){return b-2>0?b-2:0},sample:function(c){return a.randg(c/2)*2},variance:function(b){return 2*b}}),a.extend(a.exponential,{pdf:function(c,d){return c<0?0:d*b.exp(-d*c)},cdf:function(c,d){return c<0?0:1-b.exp(-d*c)},inv:function(a,c){return-b.log(1-a)/c},mean:function(a){return 1/a},median:function(a){return 1/a*b.log(2)},mode:function(b){return 0},sample:function(c){return-1/c*b.log(b.random())},variance:function(a){return b.pow(a,-2)}}),a.extend(a.gamma,{pdf:function(d,e,f){return b.exp((e-1)*b.log(d)-d/f-a.gammaln(e)-e*b.log(f))},cdf:function(c,d,e){return a.gammap(d,c/e)},inv:function(b,c,d){return a.gammapinv(b,c)*d},mean:function(a,b){return a*b},mode:function(b,c){return b>1?(b-1)*c:undefined},sample:function(c,d){return a.randg(c)*d},variance:function(b,c){return b*c*c}}),a.extend(a.invgamma,{pdf:function(d,e,f){return b.exp(-(e+1)*b.log(d)-f/d-a.gammaln(e)+e*b.log(f))},cdf:function(c,d,e){return 1-a.gammap(d,e/c)},inv:function(b,c,d){return d/a.gammapinv(1-b,c)},mean:function(a,b){return a>1?b/(a-1):undefined},mode:function(b,c){return c/(b+1)},sample:function(c,d){return d/a.randg(c)},variance:function(b,c){return b<=2?undefined:c*c/((b-1)*(b-1)*(b-2))}}),a.extend(a.kumaraswamy,{pdf:function(c,d,e){return b.exp(b.log(d)+b.log(e)+(d-1)*b.log(c)+(e-1)*b.log(1-b.pow(c,d)))},cdf:function(c,d,e){return 1-b.pow(1-b.pow(c,d),e)},mean:function(b,c){return c*a.gammafn(1+1/b)*a.gammafn(c)/a.gammafn(1+1/b+c)},median:function(c,d){return b.pow(1-b.pow(2,-1/d),1/c)},mode:function(c,d){return c>=1&&d>=1&&c!==1&&d!==1?b.pow((c-1)/(c*d-1),1/c):undefined},variance:function(b,c){throw new Error("variance not yet implemented")}}),a.extend(a.lognormal,{pdf:function(c,d,e){return b.exp(-b.log(c)-.5*b.log(2*b.PI)-b.log(e)-b.pow(b.log(c)-d,2)/(2*e*e))},cdf:function(d,e,f){return.5+.5*a.erf((b.log(d)-e)/b.sqrt(2*f*f))},inv:function(c,d,e){return b.exp(-1.4142135623730951*e*a.erfcinv(2*c)+d)},mean:function(c,d){return b.exp(c+d*d/2)},median:function(c,d){return b.exp(c)},mode:function(c,d){return b.exp(c-d*d)},sample:function(d,e){return b.exp(a.randn()*e+d)},variance:function(c,d){return(b.exp(d*d)-1)*b.exp(2*c+d*d)}}),a.extend(a.normal,{pdf:function(c,d,e){return b.exp(-0.5*b.log(2*b.PI)-b.log(e)-b.pow(c-d,2)/(2*e*e))},cdf:function(d,e,f){return.5*(1+a.erf((d-e)/b.sqrt(2*f*f)))},inv:function(b,c,d){return-1.4142135623730951*d*a.erfcinv(2*b)+c},mean:function(a,b){return a},median:function(b,c){return b},mode:function(a,b){return a},sample:function(c,d){return a.randn()*d+c},variance:function(a,b){return b*b}}),a.extend(a.pareto,{pdf:function(c,d,e){return c<d?undefined:e*b.pow(d,e)/b.pow(c,e+1)},cdf:function(c,d,e){return 1-b.pow(d/c,e)},mean:function(c,d){return d<=1?undefined:d*b.pow(c,d)/(d-1)},median:function(c,d){return c*d*b.SQRT2},mode:function(b,c){return b},variance:function(a,c){return c<=2?undefined:a*a*c/(b.pow(c-1,2)*(c-2))}}),a.extend(a.studentt,{pdf:function(d,e){return a.gammafn((e+1)/2)/(b.sqrt(e*b.PI)*a.gammafn(e/2))*b.pow(1+d*d/e,-((e+1)/2))},cdf:function(d,e){var f=e/2;return a.ibeta((d+b.sqrt(d*d+e))/(2*b.sqrt(d*d+e)),f,f)},inv:function(c,d){var e=a.ibetainv(2*b.min(c,1-c),.5*d,.5);return e=b.sqrt(d*(1-e)/e),c>.5?e:-e},mean:function(b){return b>1?0:undefined},median:function(b){return 0},mode:function(b){return 0},sample:function(d){return a.randn()*b.sqrt(d/(2*a.randg(d/2)))},variance:function(b){return b>2?b/(b-2):b>1?Infinity:undefined}}),a.extend(a.weibull,{pdf:function(c,d,e){return c<0?0:e/d*b.pow(c/d,e-1)*b.exp(-b.pow(c/d,e))},cdf:function(c,d,e){return c<0?0:1-b.exp(-b.pow(c/d,e))},inv:function(a,c,d){return c*b.pow(-b.log(1-a),1/d)},mean:function(b,c){return b*a.gammafn(1+1/c)},median:function(c,d){return c*b.pow(b.log(2),1/d)},mode:function(c,d){return d<=1?undefined:c*b.pow((d-1)/d,1/d)},sample:function(c,d){return c*b.pow(-b.log(b.random()),1/d)},variance:function(d,e){return d*d*a.gammafn(1+2/e)-b.pow(this.mean(d,e),2)}}),a.extend(a.uniform,{pdf:function(b,c,d){return b<c||b>d?0:1/(d-c)},cdf:function(b,c,d){return b<c?0:b<d?(b-c)/(d-c):1},inv:function(a,b,c){return b+a*(c-b)},mean:function(b,c){return.5*(b+c)},median:function(c,d){return a.mean(c,d)},mode:function(b,c){throw new Error("mode is not yet implemented")},sample:function(c,d){return c/2+d/2+(d/2-c/2)*(2*b.random()-1)},variance:function(c,d){return b.pow(d-c,2)/12}}),a.extend(a.binomial,{pdf:function(d,e,f){return f===0||f===1?e*f===d?1:0:a.combination(e,d)*b.pow(f,d)*b.pow(1-f,e-d)},cdf:function(c,d,e){var f=[],g=0;if(c<0)return 0;if(c<d){for(;g<=c;g++)f[g]=a.binomial.pdf(g,d,e);return a.sum(f)}return 1}}),a.extend(a.negbin,{pdf:function(d,e,f){return d!==d|0?!1:d<0?0:a.combination(d+e-1,e-1)*b.pow(1-f,d)*b.pow(f,e)},cdf:function(c,d,e){var f=0,g=0;if(c<0)return 0;for(;g<=c;g++)f+=a.negbin.pdf(g,d,e);return f}}),a.extend(a.hypgeom,{pdf:function(d,e,f,g){if(d!==d|0)return!1;if(d<0||d<f-(e-g))return 0;if(d>g||d>f)return 0;if(f*2>e)return g*2>e?a.hypgeom.pdf(e-f-g+d,e,e-f,e-g):a.hypgeom.pdf(g-d,e,e-f,g);if(g*2>e)return a.hypgeom.pdf(f-d,e,f,e-g);if(f<g)return a.hypgeom.pdf(d,e,g,f);var h=1,i=0;for(var j=0;j<d;j++){while(h>1&&i<g)h*=1-f/(e-i),i++;h*=(g-j)*(f-j)/((j+1)*(e-f-g+j+1))}for(;i<g;i++)h*=1-f/(e-i);return b.min(1,b.max(0,h))},cdf:function(d,e,f,g){if(d<0||d<f-(e-g))return 0;if(d>=g||d>=f)return 1;if(f*2>e)return g*2>e?a.hypgeom.cdf(e-f-g+d,e,e-f,e-g):1-a.hypgeom.cdf(g-d-1,e,e-f,g);if(g*2>e)return 1-a.hypgeom.cdf(f-d-1,e,f,e-g);if(f<g)return a.hypgeom.cdf(d,e,g,f);var h=1,i=1,j=0;for(var k=0;k<d;k++){while(h>1&&j<g){var l=1-f/(e-j);i*=l,h*=l,j++}i*=(g-k)*(f-k)/((k+1)*(e-f-g+k+1)),h+=i}for(;j<g;j++)h*=1-f/(e-j);return b.min(1,b.max(0,h))}}),a.extend(a.poisson,{pdf:function(d,e){return b.pow(e,d)*b.exp(-e)/a.factorial(d)},cdf:function(c,d){var e=[],f=0;if(c<0)return 0;for(;f<=c;f++)e.push(a.poisson.pdf(f,d));return a.sum(e)},mean:function(a){return a},variance:function(a){return a},sample:function(c){var d=1,e=0,f=b.exp(-c);do e++,d*=b.random();while(d>f);return e-1}}),a.extend(a.triangular,{pdf:function(b,c,d,e){return d<=c||e<c||e>d?undefined:b<c||b>d?0:b<=e?2*(b-c)/((d-c)*(e-c)):2*(d-b)/((d-c)*(d-e))},cdf:function(c,d,e,f){return e<=d||f<d||f>e?undefined:c<d?0:c<=f?b.pow(c-d,2)/((e-d)*(f-d)):1-b.pow(e-c,2)/((e-d)*(e-f))},mean:function(b,c,d){return(b+c+d)/3},median:function(c,d,e){if(e<=(c+d)/2)return d-b.sqrt((d-c)*(d-e))/b.sqrt(2);if(e>(c+d)/2)return c+b.sqrt((d-c)*(e-c))/b.sqrt(2)},mode:function(b,c,d){return d},sample:function(c,d,e){var f=b.random();return f<(e-c)/(d-c)?c+b.sqrt(f*(d-c)*(e-c)):d-b.sqrt((1-f)*(d-c)*(d-e))},variance:function(b,c,d){return(b*b+c*c+d*d-b*c-b*d-c*d)/18}})}(this.jStat,Math),function(a,b){var d=Array.prototype.push,e=a.utils.isArray;a.extend({add:function(c,d){return e(d)?(e(d[0])||(d=[d]),a.map(c,function(a,b,c){return a+d[b][c]})):a.map(c,function(a){return a+d})},subtract:function(c,d){return e(d)?(e(d[0])||(d=[d]),a.map(c,function(a,b,c){return a-d[b][c]||0})):a.map(c,function(a){return a-d})},divide:function(c,d){return e(d)?(e(d[0])||(d=[d]),a.multiply(c,a.inv(d))):a.map(c,function(a){return a/d})},multiply:function(c,d){var f,g,h,i,j=c.length,k=c[0].length,l=a.zeros(j,h=e(d)?d[0].length:k),m=0;if(e(d)){for(;m<h;m++)for(f=0;f<j;f++){i=0;for(g=0;g<k;g++)i+=c[f][g]*d[g][m];l[f][m]=i}return j===1&&m===1?l[0][0]:l}return a.map(c,function(a){return a*d})},dot:function(c,d){e(c[0])||(c=[c]),e(d[0])||(d=[d]);var f=c[0].length===1&&c.length!==1?a.transpose(c):c,g=d[0].length===1&&d.length!==1?a.transpose(d):d,h=[],i=0,j=f.length,k=f[0].length,l,m;for(;i<j;i++){h[i]=[],l=0;for(m=0;m<k;m++)l+=f[i][m]*g[i][m];h[i]=l}return h.length===1?h[0]:h},pow:function(d,e){return a.map(d,function(a){return b.pow(a,e)})},exp:function(d){return a.map(d,function(a){return b.exp(a)})},log:function(d){return a.map(d,function(a){return b.log(a)})},abs:function(d){return a.map(d,function(a){return b.abs(a)})},norm:function(c,d){var f=0,g=0;isNaN(d)&&(d=2),e(c[0])&&(c=c[0]);for(;g<c.length;g++)f+=b.pow(b.abs(c[g]),d);return b.pow(f,1/d)},angle:function(d,e){return b.acos(a.dot(d,e)/(a.norm(d)*a.norm(e)))},aug:function(b,c){var e=b.slice(),f=0;for(;f<e.length;f++)d.apply(e[f],c[f]);return e},inv:function(c){var d=c.length,e=c[0].length,f=a.identity(d,e),g=a.gauss_jordan(c,f),h=[],i=0,j;for(;i<d;i++){h[i]=[];for(j=e;j<g[0].length;j++)h[i][j-e]=g[i][j]}return h},det:function(b){var c=b.length,d=c*2,e=new Array(d),f=c-1,g=d-1,h=f-c+1,i=g,j=0,k=0,l;if(c===2)return b[0][0]*b[1][1]-b[0][1]*b[1][0];for(;j<d;j++)e[j]=1;for(j=0;j<c;j++){for(l=0;l<c;l++)e[h<0?h+c:h]*=b[j][l],e[i<c?i+c:i]*=b[j][l],h++,i--;h=--f-c+1,i=--g}for(j=0;j<c;j++)k+=e[j];for(;j<d;j++)k-=e[j];return k},gauss_elimination:function(d,e){var f=0,g=0,h=d.length,i=d[0].length,j=1,k=0,l=[],m,n,o,p;d=a.aug(d,e),m=d[0].length;for(f=0;f<h;f++){n=d[f][f],g=f;for(p=f+1;p<i;p++)n<b.abs(d[p][f])&&(n=d[p][f],g=p);if(g!=f)for(p=0;p<m;p++)o=d[f][p],d[f][p]=d[g][p],d[g][p]=o;for(g=f+1;g<h;g++){j=d[g][f]/d[f][f];for(p=f;p<m;p++)d[g][p]=d[g][p]-j*d[f][p]}}for(f=h-1;f>=0;f--){k=0;for(g=f+1;g<=h-1;g++)k+=l[g]*d[f][g];l[f]=(d[f][m-1]-k)/d[f][f]}return l},gauss_jordan:function(e,f){var g=a.aug(e,f),h=g.length,i=g[0].length;for(var j=0;j<h;j++){var k=j;for(var l=j+1;l<h;l++)b.abs(g[l][j])>b.abs(g[k][j])&&(k=l);var m=g[j];g[j]=g[k],g[k]=m;for(var l=j+1;l<h;l++){c=g[l][j]/g[j][j];for(var n=j;n<i;n++)g[l][n]-=g[j][n]*c}}for(var j=h-1;j>=0;j--){c=g[j][j];for(var l=0;l<j;l++)for(var n=i-1;n>j-1;n--)g[l][n]-=g[j][n]*g[l][j]/c;g[j][j]/=c;for(var n=h;n<i;n++)g[j][n]/=c}return g},lu:function(b,c){throw new Error("lu not yet implemented")},cholesky:function(b,c){throw new Error("cholesky not yet implemented")},gauss_jacobi:function(d,e,f,g){var h=0,i=0,j=d.length,k=[],l=[],m=[],n,o,p,q;for(;h<j;h++){k[h]=[],l[h]=[],m[h]=[];for(i=0;i<j;i++)h>i?(k[h][i]=d[h][i],l[h][i]=m[h][i]=0):h<i?(l[h][i]=d[h][i],k[h][i]=m[h][i]=0):(m[h][i]=d[h][i],k[h][i]=l[h][i]=0)}p=a.multiply(a.multiply(a.inv(m),a.add(k,l)),-1),o=a.multiply(a.inv(m),e),n=f,q=a.add(a.multiply(p,f),o),h=2;while(b.abs(a.norm(a.subtract(q,n)))>g)n=q,q=a.add(a.multiply(p,n),o),h++;return q},gauss_seidel:function(d,e,f,g){var h=0,i=d.length,j=[],k=[],l=[],m,n,o,p,q;for(;h<i;h++){j[h]=[],k[h]=[],l[h]=[];for(m=0;m<i;m++)h>m?(j[h][m]=d[h][m],k[h][m]=l[h][m]=0):h<m?(k[h][m]=d[h][m],j[h][m]=l[h][m]=0):(l[h][m]=d[h][m],j[h][m]=k[h][m]=0)}p=a.multiply(a.multiply(a.inv(a.add(l,j)),k),-1),o=a.multiply(a.inv(a.add(l,j)),e),n=f,q=a.add(a.multiply(p,f),o),h=2;while(b.abs(a.norm(a.subtract(q,n)))>g)n=q,q=a.add(a.multiply(p,n),o),h+=1;return q},SOR:function(d,e,f,g,h){var i=0,j=d.length,k=[],l=[],m=[],n,o,p,q,r;for(;i<j;i++){k[i]=[],l[i]=[],m[i]=[];for(n=0;n<j;n++)i>n?(k[i][n]=d[i][n],l[i][n]=m[i][n]=0):i<n?(l[i][n]=d[i][n],k[i][n]=m[i][n]=0):(m[i][n]=d[i][n],k[i][n]=l[i][n]=0)}q=a.multiply(a.inv(a.add(m,a.multiply(k,h))),a.subtract(a.multiply(m,1-h),a.multiply(l,h))),p=a.multiply(a.multiply(a.inv(a.add(m,a.multiply(k,h))),e),h),o=f,r=a.add(a.multiply(q,f),p),i=2;while(b.abs(a.norm(a.subtract(r,o)))>g)o=r,r=a.add(a.multiply(q,o),p),i++;return r},householder:function(d){var e=d.length,f=d[0].length,g=0,h=[],i=[],j,k,l,m,n;for(;g<e-1;g++){j=0;for(m=g+1;m<f;m++)j+=d[m][g]*d[m][g];n=d[g+1][g]>0?-1:1,j=n*b.sqrt(j),k=b.sqrt((j*j-d[g+1][g]*j)/2),h=a.zeros(e,1),h[g+1][0]=(d[g+1][g]-j)/(2*k);for(l=g+2;l<e;l++)h[l][0]=d[l][g]/(2*k);i=a.subtract(a.identity(e,f),a.multiply(a.multiply(h,a.transpose(h)),2)),d=a.multiply(i,a.multiply(d,i))}return d},QR:function(d,e){var f=d.length,g=d[0].length,h=0,i=[],j=[],k=[],l,m,n,o,p,q;for(;h<f-1;h++){m=0;for(l=h+1;l<g;l++)m+=d[l][h]*d[l][h];p=d[h+1][h]>0?-1:1,m=p*b.sqrt(m),n=b.sqrt((m*m-d[h+1][h]*m)/2),i=a.zeros(f,1),i[h+1][0]=(d[h+1][h]-m)/(2*n);for(o=h+2;o<f;o++)i[o][0]=d[o][h]/(2*n);j=a.subtract(a.identity(f,g),a.multiply(a.multiply(i,a.transpose(i)),2)),d=a.multiply(j,d),e=a.multiply(j,e)}for(h=f-1;h>=0;h--){q=0;for(l=h+1;l<=g-1;l++)q=k[l]*d[h][l];k[h]=e[h][0]/d[h][h]}return k},jacobi:function(d){var e=1,f=0,g=d.length,h=a.identity(g,g),i=[],j,k,l,m,n,o,p,q;while(e===1){f++,o=d[0][1],m=0,n=1;for(k=0;k<g;k++)for(l=0;l<g;l++)k!=l&&o<b.abs(d[k][l])&&(o=b.abs(d[k][l]),m=k,n=l);d[m][m]===d[n][n]?p=d[m][n]>0?b.PI/4:-b.PI/4:p=b.atan(2*d[m][n]/(d[m][m]-d[n][n]))/2,q=a.identity(g,g),q[m][m]=b.cos(p),q[m][n]=-b.sin(p),q[n][m]=b.sin(p),q[n][n]=b.cos(p),h=a.multiply(h,q),j=a.multiply(a.multiply(a.inv(q),d),q),d=j,e=0;for(k=1;k<g;k++)for(l=1;l<g;l++)k!=l&&b.abs(d[k][l])>.001&&(e=1)}for(k=0;k<g;k++)i.push(d[k][k]);return[h,i]},rungekutta:function(b,c,d,e,f,g){var h,i,j,k,l;if(g===2)while(e<=d)h=c*b(e,f),i=c*b(e+c,f+h),j=f+(h+i)/2,f=j,e+=c;if(g===4)while(e<=d)h=c*b(e,f),i=c*b(e+c/2,f+h/2),k=c*b(e+c/2,f+i/2),l=c*b(e+c,f+k),j=f+(h+2*i+2*k+l)/6,f=j,e+=c;return f},romberg:function(c,d,e,f){var g=0,h=(e-d)/2,i=[],j=[],k=[],l,m,n,o,p,q;while(g<f/2){p=c(d);for(n=d,o=0;n<=e;n+=h,o++)i[o]=n;l=i.length;for(n=1;n<l-1;n++)p+=(n%2!==0?4:2)*c(i[n]);p=h/3*(p+c(e)),k[g]=p,h/=2,g++}m=k.length,l=1;while(m!==1){for(n=0;n<m-1;n++)j[n]=(b.pow(4,l)*k[n+1]-k[n])/(b.pow(4,l)-1);m=j.length,k=j,j=[],l++}return k},richardson:function(c,d,e,f){function g(a,b){var c=0,d=a.length,e;for(;c<d;c++)a[c]===b&&(e=c);return e}var h=c.length,i=b.abs(e-c[g(c,e)+1]),j=0,k=[],l=[],m,n,o,p,q;while(f>=i)m=g(c,e+f),n=g(c,e),k[j]=(d[m]-2*d[n]+d[2*n-m])/(f*f),f/=2,j++;p=k.length,o=1;while(p!=1){for(q=0;q<p-1;q++)l[q]=(b.pow(4,o)*k[q+1]-k[q])/(b.pow(4,o)-1);p=l.length,k=l,l=[],o++}return k},simpson:function(b,c,d,e){var f=(d-c)/e,g=b(c),h=[],i=c,j=0,k=1,l;for(;i<=d;i+=f,j++)h[j]=i;l=h.length;for(;k<l-1;k++)g+=(k%2!==0?4:2)*b(h[k]);return f/3*(g+b(d))},hermite:function(b,c,d,e){var f=b.length,g=0,h=0,i=[],j=[],k=[],l=[],m;for(;h<f;h++){i[h]=1;for(m=0;m<f;m++)h!=m&&(i[h]*=(e-b[m])/(b[h]-b[m]));j[h]=0;for(m=0;m<f;m++)h!=m&&(j[h]+=1/(b[h]-b[m]));k[h]=(1-2*(e-b[h])*j[h])*i[h]*i[h],l[h]=(e-b[h])*i[h]*i[h],g+=k[h]*c[h]+l[h]*d[h]}return g},lagrange:function(b,c,d){var e=0,f=0,g,h,i=b.length;for(;f<i;f++){h=c[f];for(g=0;g<i;g++)f!=g&&(h*=(d-b[g])/(b[f]-b[g]));e+=h}return e},cubic_spline:function(c,d,e){var f=c.length,g=0,h,i=[],j=[],k=[],l=[],m=[],n=[],o=[];for(;g<f-1;g++)m[g]=c[g+1]-c[g];k[0]=0;for(g=1;g<f-1;g++)k[g]=3/m[g]*(d[g+1]-d[g])-3/m[g-1]*(d[g]-d[g-1]);for(g=1;g<f-1;g++)i[g]=[],j[g]=[],i[g][g-1]=m[g-1],i[g][g]=2*(m[g-1]+m[g]),i[g][g+1]=m[g],j[g][0]=k[g];l=a.multiply(a.inv(i),j);for(h=0;h<f-1;h++)n[h]=(d[h+1]-d[h])/m[h]-m[h]*(l[h+1][0]+2*l[h][0])/3,o[h]=(l[h+1][0]-l[h][0])/(3*m[h]);for(h=0;h<f;h++)if(c[h]>e)break;return h-=1,d[h]+(e-c[h])*n[h]+a.sq(e-c[h])*l[h]+(e-c[h])*a.sq(e-c[h])*o[h]},gauss_quadrature:function(){throw new Error("gauss_quadrature not yet implemented")},PCA:function(c){var d=c.length,e=c[0].length,f=!1,g=0,h,i,j=[],k=[],l=[],m=[],n=[],o=[],p=[],q=[],r=[],s=[];for(g=0;g<d;g++)j[g]=a.sum(c[g])/e;for(g=0;g<e;g++){p[g]=[];for(h=0;h<d;h++)p[g][h]=c[h][g]-j[h]}p=a.transpose(p);for(g=0;g<d;g++){q[g]=[];for(h=0;h<d;h++)q[g][h]=a.dot([p[g]],[p[h]])/(e-1)}l=a.jacobi(q),r=l[0],k=l[1],s=a.transpose(r);for(g=0;g<k.length;g++)for(h=g;h<k.length;h++)k[g]<k[h]&&(i=k[g],k[g]=k[h],k[h]=i,m=s[g],s[g]=s[h],s[h]=m);o=a.transpose(p);for(g=0;g<d;g++){n[g]=[];for(h=0;h<o.length;h++)n[g][h]=a.dot([s[g]],[o[h]])}return[c,k,s,n]}}),function(b){for(var c=0;c<b.length;c++)(function(b){a.fn[b]=function(c,d){var e=this;return d?(setTimeout(function(){d.call(e,a.fn[b].call(e,c))},15),this):typeof a[b](this,c)=="number"?a[b](this,c):a(a[b](this,c))}})(b[c])}("add divide multiply subtract dot pow exp log abs norm angle".split(" "))}(this.jStat,Math),function(a,b){var c=[].slice,d=a.utils.isNumber;a.extend({zscore:function(){var e=c.call(arguments);return d(e[1])?(e[0]-e[1])/e[2]:(e[0]-a.mean(e[1]))/a.stdev(e[1],e[2])},ztest:function(){var f=c.call(arguments);if(f.length===4){if(d(f[1])){var g=a.zscore(f[0],f[1],f[2]);return f[3]===1?a.normal.cdf(-b.abs(g),0,1):a.normal.cdf(-b.abs(g),0,1)*2}var g=f[0];return f[2]===1?a.normal.cdf(-b.abs(g),0,1):a.normal.cdf(-b.abs(g),0,1)*2}var g=a.zscore(f[0],f[1],f[3]);return f[1]===1?a.normal.cdf(-b.abs(g),0,1):a.normal.cdf(-b.abs(g),0,1)*2}}),a.extend(a.fn,{zscore:function(b,c){return(b-this.mean())/this.stdev(c)},ztest:function(d,e,f){var g=b.abs(this.zscore(d,f));return e===1?a.normal.cdf(-g,0,1):a.normal.cdf(-g,0,1)*2
}}),a.extend({tscore:function(){var e=c.call(arguments);return e.length===4?(e[0]-e[1])/(e[2]/b.sqrt(e[3])):(e[0]-a.mean(e[1]))/(a.stdev(e[1],!0)/b.sqrt(e[1].length))},ttest:function(){var f=c.call(arguments),g;return f.length===5?(g=b.abs(a.tscore(f[0],f[1],f[2],f[3])),f[4]===1?a.studentt.cdf(-g,f[3]-1):a.studentt.cdf(-g,f[3]-1)*2):d(f[1])?(g=b.abs(f[0]),f[2]==1?a.studentt.cdf(-g,f[1]-1):a.studentt.cdf(-g,f[1]-1)*2):(g=b.abs(a.tscore(f[0],f[1])),f[2]==1?a.studentt.cdf(-g,f[1].length-1):a.studentt.cdf(-g,f[1].length-1)*2)}}),a.extend(a.fn,{tscore:function(c){return(c-this.mean())/(this.stdev(!0)/b.sqrt(this.cols()))},ttest:function(d,e){return e===1?1-a.studentt.cdf(b.abs(this.tscore(d)),this.cols()-1):a.studentt.cdf(-b.abs(this.tscore(d)),this.cols()-1)*2}}),a.extend({anovafscore:function(){var e=c.call(arguments),f,g,h,i,j,k,l,m;if(e.length===1){j=new Array(e[0].length);for(l=0;l<e[0].length;l++)j[l]=e[0][l];e=j}if(e.length===2)return a.variance(e[0])/a.variance(e[1]);g=new Array;for(l=0;l<e.length;l++)g=g.concat(e[l]);h=a.mean(g),f=0;for(l=0;l<e.length;l++)f+=e[l].length*b.pow(a.mean(e[l])-h,2);f/=e.length-1,k=0;for(l=0;l<e.length;l++){i=a.mean(e[l]);for(m=0;m<e[l].length;m++)k+=b.pow(e[l][m]-i,2)}return k/=g.length-e.length,f/k},anovaftest:function(){var e=c.call(arguments),f,g,h,i;if(d(e[0]))return 1-a.centralF.cdf(e[0],e[1],e[2]);anovafscore=a.anovafscore(e),f=e.length-1,h=0;for(i=0;i<e.length;i++)h+=e[i].length;return g=h-f-1,1-a.centralF.cdf(anovafscore,f,g)},ftest:function(c,d,e){return 1-a.centralF.cdf(c,d,e)}}),a.extend(a.fn,{anovafscore:function(){return a.anovafscore(this.toArray())},anovaftes:function(){var c=0,d;for(d=0;d<this.length;d++)c+=this[d].length;return a.ftest(this.anovafscore(),this.length-1,c-this.length)}}),a.extend({normalci:function(){var e=c.call(arguments),f=new Array(2),g;return e.length===4?g=b.abs(a.normal.inv(e[1]/2,0,1)*e[2]/b.sqrt(e[3])):g=b.abs(a.normal.inv(e[1]/2,0,1)*a.stdev(e[2])/b.sqrt(e[2].length)),f[0]=e[0]-g,f[1]=e[0]+g,f},tci:function(){var e=c.call(arguments),f=new Array(2),g;return e.length===4?g=b.abs(a.studentt.inv(e[1]/2,e[3]-1)*e[2]/b.sqrt(e[3])):g=b.abs(a.studentt.inv(e[1]/2,e[2].length-1)*a.stdev(e[2],!0)/b.sqrt(e[2].length)),f[0]=e[0]-g,f[1]=e[0]+g,f},significant:function(b,c){return b<c}}),a.extend(a.fn,{normalci:function(c,d){return a.normalci(c,d,this.toArray())},tci:function(c,d){return a.tci(c,d,this.toArray())}})}(this.jStat,Math);/**
 * chrisw@soe.ucsc.edu
 * April 10, 2014
 * Finally decided to keep static utility methods in a separate js file.
 *
 * Full functionality requires:
 * 1) jStat
 * 2) d3js
 * 3) jQuery
 */

/**
 * Functions and vars to be added to this global object.
 */
var utils = utils || {};

(function(u) {"use strict";
    // console.log('self-executing anonymous function');

    u.htmlNamespaceUri = 'http://www.w3.org/1999/xhtml';

    u.svgNamespaceUri = 'http://www.w3.org/2000/svg';

    // use with "xlink:href" for images in svg as in <http://www.w3.org/Graphics/SVG/WG/wiki/Href>
    u.xlinkUri = "http://www.w3.org/1999/xlink";

    /**
     * convert radian to degree
     */
    u.toDegrees = function(angle) {
        return angle * (180 / Math.PI);
    };

    /**
     * convert degree to radian
     */
    u.toRadians = function(angle) {
        return angle * (Math.PI / 180);
    };

    /**
     * Check if an object has the specified property.
     */
    u.hasOwnProperty = function(obj, prop) {
        var proto = obj.__proto__ || obj.constructor.prototype;
        return ( prop in obj) && (!( prop in proto) || proto[prop] !== obj[prop]);
    };

    /**
     * Fisher-Yates (aka Knuth) Shuffle
     * http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
     */
    u.shuffleArray = function(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    };

    /**
     * Check if an array contains specified object.
     */
    u.isObjInArray = function(array, obj) {
        var result = false;
        var index = array.indexOf(obj);
        if (index >= 0) {
            result = true;
        }
        return result;
    };

    /**
     * remove from array by value (instead of index)
     */
    u.removeA = function(arr) {
        var what, a = arguments, L = a.length, ax;
        while (L > 1 && arr.length) {
            what = a[--L];
            while (( ax = arr.indexOf(what)) !== -1) {
                arr.splice(ax, 1);
            }
        }
        return arr;
    };

    /**
     * Get an object's attribute keys in an array.
     * @param {Object} obj
     */
    u.getKeys = function(obj) {
        var keys = [];
        for (var key in obj) {
            keys.push(key);
        }
        return keys;
    };

    /**
     * Get the object's attribute values in an array
     */
    u.getValues = function(obj) {
        var vals = [];
        var keys = u.getKeys(obj);
        for (var i = 0, length = keys.length; i < length; i++) {
            var val = obj[keys[i]];
            vals.push(val);
        }
        return vals;
    };

    /**
     * Only unique and first instance of duplicated elements is returned. Ordering is preserved.
     */
    u.eliminateDuplicates = function(array) {
        var result = [];

        for (var i = 0; i < array.length; i++) {
            var element = array[i];
            if (u.isObjInArray(result, element)) {
                continue;
            } else {
                result.push(element);
            }
        }
        return result;
    };

    /**
     * Keep items that appear multiple times.  Original order of items is lost.
     */
    u.keepReplicates = function(arr, threshold, keepUniques) {
        var counts = {};
        // tally counts
        for (var i = 0; i < arr.length; i++) {
            var value = arr[i];
            if ( value in counts) {
            } else {
                counts[value] = 0;
            }
            counts[value]++;
        }
        // apply threshold
        threshold = (threshold == null) ? 2 : threshold;
        var outList = [];
        for (var value in counts) {
            if ((keepUniques != null) && (keepUniques)) {
                if (counts[value] < threshold) {
                    outList.push(value);
                }
            } else {
                if (counts[value] >= threshold) {
                    outList.push(value);
                }
            }
        }
        return outList;
    };

    u.beginsWith = function(str, prefix) {
        return str.indexOf(prefix) === 0;
    };

    u.endsWith = function(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    };

    u.lengthOfLongestString = function(arrayOfStrings) {
        var lengths = new Array();
        for (var i in arrayOfStrings) {
            lengths.push(arrayOfStrings[i].length);
        }
        var maxLength = Math.max.apply(null, lengths);
        return maxLength;
    };

    u.isNumerical = function(val) {
        var result = true;
        if (val == null || val === "") {
            return false;
        }

        // As per IEEE-754 spec, a nan checked for equality against itself will be unequal (in other words, nan != nan)
        // ref: http://kineme.net/Discussion/DevelopingCompositions/CheckifnumberNaNjavascriptpatch
        if (isNaN(val)) {
            return false;
        }
        return result;
    };

    /**
     * get the selected values of a list box control.
     */
    u.getListBoxSelectedValues = function(listboxElement) {
        var selectedValues = new Array();
        for (var i = 0; i < listboxElement.length; i++) {
            var option = listboxElement[i];
            if (option.selected) {
                selectedValues.push(option.value);
            }
        }
        return selectedValues;
    };

    /**
     * linear interpolation
     * @param {Object} percent
     * @param {Object} minVal
     * @param {Object} maxVal
     */
    u.linearInterpolation = function(percent, minVal, maxVal) {
        return ((maxVal - minVal) * percent) + minVal;
    };

    /**
     * Set the numericValue to be in the range [min, max].
     */
    u.rangeLimit = function(numericValue, min, max) {
        var result;
        if ( typeof min === 'undefined') {
            min = -1;
        }
        if ( typeof max === 'undefined') {
            max = 1;
        }
        if (numericValue < min) {
            result = min;
        } else if (numericValue > max) {
            result = max;
        } else {
            result = numericValue;
        }
        return result;
    };

    // TODO object conversion

    /**
     * Clone an object.
     * Requires jQuery
     * https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object
     */
    u.cloneObject = function(objToBeCloned, deepCopy) {
        // var newObject = eval(objToBeCloned.toSource());
        var newObject;
        if (deepCopy) {
            newObject = jQuery.extend(true, {}, objToBeCloned);
        } else {
            newObject = jQuery.extend({}, objToBeCloned);
        }
        return newObject;
    };

    /**
     * Get an obj without its jQuery wrapping.
     */
    u.extractFromJq = function(jqObj) {
        var jsObj = jqObj.get(0);
        return jsObj;
    };

    /**
     * Wrap an object with jQuery.
     */
    u.convertToJq = function(jsObj) {
        var jqObj = $(jsObj);
        return jsObj;
    };

    /**
     * Get the DOM element from a d3.select()'ed object.
     */
    u.extractFromD3 = function(d3Selection) {
        var domElement = d3Selection.node();
        return domElement;
    };

    /**
     * Convert a DOM element to a d3.selected()'ed object.
     */
    u.convertToD3 = function(domElement) {
        var d3Selection = d3.select(domElement);
        return d3Selection;
    };

    // TODO flexible sort
    /**
     *Sort array of objects by some specified field. Primer specifies a pre-processing to perform on compared value.
     * (from https://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects)
     */
    u.sort_by = function(field, reverse, primer) {
        // function to get value to compare
        var key = primer ? function(elementObj) {
            return primer(elementObj[field]);
        } : function(elementObj) {
            return elementObj[field];
        };

        reverse = [-1, 1][+!!reverse];

        // return comparator function
        return function(a, b) {
            return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
        };
    };

    // TODO comparator functions

    /**
     *Compare as numbers
     */
    u.compareAsNumeric = function(a, b) {
        var valA = a;
        var valB = b;

        // convert to numbers
        var scoreA = parseFloat(valA);
        var scoreB = parseFloat(valB);

        if (utils.isNumerical(scoreA) && (utils.isNumerical(scoreB))) {
            if (scoreA < scoreB) {
                return -1;
            }
            if (scoreA > scoreB) {
                return 1;
            } else {
                return 0;
            }
        } else {
            // handle non-numericals
            if (scoreA != scoreA && scoreB != scoreB) {
                // both non-numerical, may be nulls
                return 0;
            } else if (scoreA != scoreA) {
                return -1;
            } else if (scoreB != scoreB) {
                return 1;
            }
        }
        // default scoring
        return 0;
    };

    /**
     * Compare as string
     */
    u.compareAsString = function(a, b) {
        var valA = new String(a);
        var valB = new String(b);

        if ((valA == 'null') && (valB != 'null')) {
            return 1;
        } else if ((valA != 'null') && (valB == 'null')) {
            return -1;
        }

        return valA.localeCompare(valB);
    };

    /**
     * Compare as string
     */
    u.compareAsString_medbook = function(a, b) {
        var valA = new String(a).valueOf().toLowerCase();
        var valB = new String(b).valueOf().toLowerCase();

        // if exactly one is "null"
        if ((valA == 'null') && (valB != 'null')) {
            return 1;
        } else if ((valA != 'null') && (valB == 'null')) {
            return -1;
        }

        // if exactly one is "exclude"
        if ((valA == 'exclude') && (valB != 'exclude')) {
            return 1;
        } else if ((valA != 'exclude') && (valB == 'exclude')) {
            return -1;
        }

        // if exactly one is "small cell"
        if ((valA == 'small cell') && (valB != 'small cell')) {
            return -1;
        } else if ((valA != 'small cell') && (valB == 'small cell')) {
            return 1;
        }

        // if at least one is "exclude"
        switch (valA + valB) {
            case "excludenull":
                return -1;
                break;
            case "nullexclude":
                return 1;
                break;
            default:
                return valA.localeCompare(valB);
        }

        // return valA.localeCompare(valB);
    };

    /*
     * Compare as date
     */
    u.compareAsDate = function(a, b) {
        var valA = a;
        var valB = b;

        if (valA == null) {
            valA = '1000';
        } else if (valA == '') {
            valA = '1001';
        }

        if (valB == null) {
            valB = '1000';
        } else if (valB == '') {
            valB = '1001';
        }

        var dateA = new Date(valA);
        var dateB = new Date(valB);

        return (dateA - dateB);
    };

    // TODO color mappers

    /**
     * convert an rgb component to hex value
     * @param {Object} c
     */
    u.rgbComponentToHex = function(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    };
    /**
     * convert rgb color code to hex
     * @param {Object} r
     * @param {Object} g
     * @param {Object} b
     */
    u.rgbToHex = function(r, g, b) {
        return "#" + this.rgbComponentToHex(r) + this.rgbComponentToHex(g) + this.rgbComponentToHex(b);
    };

    /**
     * centered RGBa color mapper.  Defaults to significant Z-score range.
     */
    u.centeredRgbaColorMapper = function(log, centerVal, minNegVal, maxPosVal) {
        var mapper = null;

        var centerV = (centerVal == null) ? 0 : centerVal;
        var minNegV = (minNegVal == null) ? -1.96 : minNegVal;
        var maxPosV = (maxPosVal == null) ? 1.96 : maxPosVal;

        mapper = function(val) {
            var a = 1;
            var r = 169;
            var g = 169;
            var b = 169;

            var exponent = 1 / 2;

            var v = parseFloat(val);

            if ((v == null) || (v != v)) {
                // null or NaN values
            } else if (v > centerV) {
                r = 255;
                g = 0;
                b = 0;
                if (v > maxPosV) {
                    a = 1;
                } else {
                    a = (v - centerV) / (maxPosV - centerV);
                    a = Math.abs(a);
                    if (log) {
                        a = Math.pow(a, exponent);
                    }
                }
            } else if (v < centerV) {
                r = 0;
                g = 0;
                b = 255;
                if (v < minNegV) {
                    a = 1;
                } else {
                    a = (v - centerV) / (minNegV - centerV);
                    a = Math.abs(a);
                    if (log) {
                        a = Math.pow(a, exponent);
                    }
                }
            } else {
                r = 255;
                g = 255;
                b = 255;
                a = 1;
            }
            return "rgba(" + r + "," + g + "," + b + "," + a + ")";
        };

        return mapper;
    };

    /**
     * requires D3js
     */
    u.setupQuantileColorMapper = function(allDataValues, palette) {
        // color scale
        var colors = palette;
        if (colors == null) {
            // colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"];
            colors = ["rgb(255,255,217)", "rgb(237,248,177)", "rgb(199,233,180)", "rgb(127,205,187)", "rgb(65,182,196)", "rgb(29,145,192)", "rgb(34,94,168)", "rgb(37,52,148)", "rgb(8,29,88)"];
        }
        var buckets = colors.length;
        var colorScale = d3.scale.quantile().domain([0, buckets - 1, d3.max(allDataValues, function(d) {
            return parseFloat(d);
        })]).range(colors);

        return colorScale;
    };

    // TODO XML

    /**
     * Get an XML DOM from an XML file.  Information about DOM at <a href="https://developer.mozilla.org/en-US/docs/Web/API/document">https://developer.mozilla.org/en-US/docs/Web/API/document</a>.
     */
    u.getXmlDom_url = function(url) {
        if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {// code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.open("GET", url, false);
        xmlhttp.send();
        xmlDoc = xmlhttp.responseXML;
        return xmlDoc;
    };

    /**
     * Get an XML DOM from a text string.  Information about DOM at <a href="https://developer.mozilla.org/en-US/docs/Web/API/document">https://developer.mozilla.org/en-US/docs/Web/API/document</a>.
     */
    u.getXmlDom_string = function(txt) {
        if (window.DOMParser) {
            parser = new DOMParser();
            xmlDoc = parser.parseFromString(txt, "text/xml");
        } else {// Internet Explorer
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = false;
            xmlDoc.loadXML(txt);
        }
        return xmlDoc;
    };

    // TODO date & time

    /**
     * MySQL style date
     */
    u.getDateTime = function() {
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        var day = now.getDate();
        var hour = now.getHours();
        var minute = now.getMinutes();
        var second = now.getSeconds();
        if (month.toString().length == 1) {
            var month = '0' + month;
        }
        if (day.toString().length == 1) {
            var day = '0' + day;
        }
        if (hour.toString().length == 1) {
            var hour = '0' + hour;
        }
        if (minute.toString().length == 1) {
            var minute = '0' + minute;
        }
        if (second.toString().length == 1) {
            var second = '0' + second;
        }
        var dateTime = year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
        return dateTime;
    };

    /**
     * Date in written style.
     */
    u.todaysDate = function() {
        var months = new Array();
        months[1] = "January";
        months[2] = "February";
        months[3] = "March";
        months[4] = "April";
        months[5] = "May";
        months[6] = "June";
        months[7] = "July";
        months[8] = "August";
        months[9] = "September";
        months[10] = "October";
        months[11] = "November";
        months[12] = "December";
        var todaysdate = new Date();
        var date = todaysdate.getDate();
        var day = todaysdate.getDay() + 1;
        var month = todaysdate.getMonth() + 1;
        var yy = todaysdate.getYear();
        var year = (yy < 1000) ? yy + 1900 : yy;
        var year2 = year - (2000 * 1);
        year2 = (year2 < 10) ? "0" + year2 : year2;
        return (months[month] + " " + date + ", " + year);
    };

    // TODO DOM

    u.pushElemToBack = function(elem) {
        var parentNode = elem.parentNode;
        parentNode.insertBefore(elem, parentNode.firstChild);
        return elem;
    };

    /**
     * Bring elem to front of DOM by placing it last in the parent elem.
     */
    u.pullElemToFront = function(elem) {
        elem.parentNode.appendChild(elem);
        return elem;
    };

    /**
     * Remove an element by ID.
     */
    u.removeElemById = function(id) {
        var elem = document.getElementById(id);
        elem.parentNode.removeChild(elem);
    };

    /**
     * Remove all child elements from parentElem.
     */
    u.removeChildElems = function(parentElem) {
        while (parentElem.firstChild) {
            parentElem.removeChild(parentElem.firstChild);
        }
        return parentElem;
    };

    /**
     * Create an unattached div element
     */
    u.createDivElement = function(divId, divClass) {
        var divTag = document.createElement("div");
        if (divId != null) {
            divTag.id = divId;
        }
        if (divClass != null) {
            divTag.className = divClass;
        }
        return divTag;
    };

    /**
     * set the attributes for the specified element
     */
    u.setElemAttributes = function(element, attributes, namespace) {
        var ns = ( typeof namespace === 'undefined') ? null : namespace;
        if (attributes != null) {
            for (var attribute in attributes) {

                // console.log({
                // 'ns' : ns,
                // 'attribute' : attribute,
                // 'value' : attributes[attribute]
                // });

                element.setAttributeNS(ns, attribute, attributes[attribute]);
            }
        }
        return element;
    };

    /**
     * Assumes the parents are divs.
     */
    u.swapContainingDivs = function(nodeA, nodeB) {
        var parentA = nodeA.parentNode;
        var parentB = nodeB.parentNode;

        document.getElementById(parentA.id).appendChild(nodeB);
        document.getElementById(parentB.id).appendChild(nodeA);
    };

    // TODO URL and query strings

    /**
     * Simple asynchronous GET.  callbackFunc takes the responseText as parameter.
     */
    u.simpleAsyncGet = function(url, callbackFunc) {
        var request = new XMLHttpRequest();

        if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            request = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            request = new ActiveXObject("Microsoft.XMLHTTP");
        }

        request.onreadystatechange = function() {
            var DONE = this.DONE || 4;
            if (this.readyState === DONE) {
                if (this.status == 200) {
                    callbackFunc(this.responseText);
                } else if (this.status == 400) {
                    console.log('There was an error 400');
                } else {
                    console.log('status was not 200', this.status);
                }
            }
        };
        request.open('GET', url, true);
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        // Tells server that this call is made for ajax purposes.
        // Most libraries like jQuery/Prototype/Dojo do this
        request.send(null);
        // No data needs to be sent along with the request.
    };

    /*
     * Synchronous GET
     */
    u.getResponse = function(url) {
        var status = null;
        var xhr = null;
        xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.onload = function() {
            status = xhr.status;
            if (status != 200) {
                console.log("xhr status: " + status + " for " + url);
            }
        };
        xhr.send(null);
        var response = null;
        if (status == 200) {
            response = xhr.responseText;
        }
        return response;
    };

    /**
     * querySettings is an object to be stringified into the query string.
     * @param {Object} querySettings
     */
    u.loadNewSettings = function(querySettings) {
        var url = window.location.pathname + "?query=" + JSON.stringify(querySettings);
        window.open(url, "_self");
    };

    /**
     * Get an object with UrlQueryString data.
     */
    u.getQueryObj = function() {
        var result = {};
        var keyValuePairs = location.search.slice(1).split('&');

        keyValuePairs.forEach(function(keyValuePair) {
            keyValuePair = keyValuePair.split('=');
            result[keyValuePair[0]] = decodeURIComponent(keyValuePair[1]) || '';
        });

        return result;
    };

    /**
     * Get the value of a parameter from the query string.  If parameter has not value or does not exist, return <code>null</code>.
     * From <a href='http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values'>here</a>.
     * @param {Object} name
     */
    u.getQueryStringParameterByName = function(name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
        var results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    // TODO JSON

    /**
     * Turn serializedJson string into a JSON object.
     */
    u.parseJson = function(serializedJson) {
        var deserializedJson = JSON.parse(serializedJson);
        return deserializedJson;
    };

    /**
     *  serialize an object with option for pretty format
     */
    u.serializeJson = function(object, pretty) {
        if (pretty) {
            return JSON.stringify(object, null, '\t');
        } else {
            return JSON.stringify(object);
        }
    };

    /**
     * Get a pretty JSON.
     */
    u.prettyJson = function(object) {
        return this.serializeJson(object, true);
    };

    // TODO SVG paths

    /**
     * Returns SVG path data for a rectangle with rounded bottom corners.
     * The top-left corner is (x,y).
     * @param {Object} x
     * @param {Object} y
     * @param {Object} width
     * @param {Object} height
     * @param {Object} radius
     */
    u.bottomRoundedRectSvgPath = function(x, y, width, height, radius) {
        var pathString = '';
        pathString += "M" + x + "," + y;
        pathString += "h" + (width);
        pathString += "v" + (height - radius);
        pathString += "a" + radius + "," + radius + " 0 0 1 " + (-1 * radius) + "," + (radius);
        pathString += "h" + (-1 * (width - 2 * radius));
        pathString += "a" + radius + "," + radius + " 0 0 1 " + (-1 * radius) + "," + (-1 * radius);
        pathString += "v" + (-1 * (height - radius));
        pathString += 'z';
        return pathString;
    };

    /**
     * Returns SVG path data for a rectangle with all rounded corners.
     * The top-left corner is (x,y).
     * @param {Object} x
     * @param {Object} y
     * @param {Object} width
     * @param {Object} height
     * @param {Object} radius
     */
    u.allRoundedRectSvgPath = function(x, y, width, height, radius) {
        var pathString = '';
        pathString += "M" + (x) + "," + (y + radius);
        pathString += "a" + (radius) + "," + (radius) + " 0 0 1 " + (radius) + "," + (-1 * radius);
        pathString += "h" + (width - 2 * radius);
        pathString += "a" + radius + "," + radius + " 0 0 1 " + (radius) + "," + (radius);
        pathString += "v" + (height - 2 * radius);
        pathString += "a" + radius + "," + radius + " 0 0 1 " + (-1 * radius) + "," + (radius);
        pathString += "h" + (-1 * (width - 2 * radius));
        pathString += "a" + radius + "," + radius + " 0 0 1 " + (-1 * radius) + "," + (-1 * radius);
        pathString += "v" + (-1 * (height - 2 * radius));
        pathString += 'z';
        return pathString;
    };

    /**
     * Returns SVG path data for a rectangle with angled corners.
     * The top-left corner is (x,y).
     * @param {Object} x
     * @param {Object} y
     * @param {Object} width
     * @param {Object} height
     */
    u.allAngledRectSvgPath = function(x, y, width, height) {
        // calculated from longer side
        var pad = (width > height) ? width / 8 : height / 8;
        var pathString = '';
        pathString += "M" + (x + pad) + "," + (y);
        pathString += "h" + (width - 2 * pad);
        pathString += 'l' + pad + ',' + pad;
        pathString += "v" + (height - 2 * pad);
        pathString += 'l' + (-1 * pad) + ',' + (pad);
        pathString += "h" + (-1 * (width - 2 * pad));
        pathString += 'l' + (-1 * pad) + ',' + (-1 * pad);
        pathString += "v" + (-1 * (height - 2 * pad));
        pathString += 'z';
        return pathString;
    };

    // TODO SVG elements

    u.createSvgRingElement = function(cx, cy, r, attributes) {
        // https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
        // (rx ry x-axis-rotation large-arc-flag sweep-flag x y)+

        function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
            var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
            return {
                x : centerX + (radius * Math.cos(angleInRadians)),
                y : centerY + (radius * Math.sin(angleInRadians))
            };
        }

        function describeArc(x, y, radius, startAngle, endAngle) {
            var start = polarToCartesian(x, y, radius, endAngle);
            var end = polarToCartesian(x, y, radius, startAngle);
            var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
            var d = ["M", start.x, start.y, "A", radius, radius, 0, arcSweep, 0, end.x, end.y].join(" ");
            return d;
        }

        // TODO somehow the circle becomes invisible if using 0 to 360 degrees
        var arcPath = describeArc(cx, cy, r, 0, 359.9);

        var e = document.createElementNS(this.svgNamespaceUri, "path");
        e.setAttributeNS(null, "d", arcPath);
        if (attributes != null) {
            for (var attribute in attributes) {
                e.setAttributeNS(null, attribute, attributes[attribute]);
            }
        }
        return e;
    };

    u.createSvgCircleElement = function(cx, cy, r, attributes) {
        var e = document.createElementNS(this.svgNamespaceUri, "circle");
        e.setAttributeNS(null, "cx", cx);
        e.setAttributeNS(null, "cy", cy);
        e.setAttributeNS(null, 'r', r);
        if (attributes != null) {
            for (var attribute in attributes) {
                e.setAttributeNS(null, attribute, attributes[attribute]);
            }
        }
        return e;
    };

    u.createSvgRectElement = function(x, y, rx, ry, width, height, attributes) {
        var e = document.createElementNS(this.svgNamespaceUri, "rect");
        e.setAttributeNS(null, "x", x);
        e.setAttributeNS(null, "y", y);
        e.setAttributeNS(null, "rx", rx);
        e.setAttributeNS(null, "ry", ry);
        e.setAttributeNS(null, "width", width);
        e.setAttributeNS(null, "height", height);
        if (attributes != null) {
            for (var attribute in attributes) {
                e.setAttributeNS(null, attribute, attributes[attribute]);
            }
        }
        return e;
    };

    /**
     * Polygon is defined by a list of points as in: http://www.w3.org/TR/SVG/shapes.html#PolygonElement
     * Thus, attributes must have string with space-separated list of points keyed 'points'.
     */
    u.createSVGPolygonElement = function(attributes) {
        var e = document.createElementNS(this.svgNamespaceUri, "polygon");
        if (attributes != null) {
            for (var attribute in attributes) {
                e.setAttributeNS(null, attribute, attributes[attribute]);
            }
        }
        return e;
    };

    u.createSvgImageElement = function(imageUrl, x, y, width, height, attributes) {
        var e = document.createElementNS(this.svgNamespaceUri, "image");
        e.setAttributeNS(this.xlinkUri, "href", imageUrl);
        e.setAttributeNS(null, "x", x);
        e.setAttributeNS(null, "y", y);
        e.setAttributeNS(null, "width", width);
        e.setAttributeNS(null, "height", height);
        if (attributes != null) {
            for (var attribute in attributes) {
                e.setAttributeNS(null, attribute, attributes[attribute]);
            }
        }
        return e;
    };

    // TODO cookies

    /**
     * Cookie methods taken from:
     * <ul>
     * <li>http://jquery-howto.blogspot.com/2010/09/jquery-cookies-getsetdelete-plugin.html
     * </li>
     * <li>http://www.quirksmode.org/js/cookies.html
     * </li>
     * </ul>
     * @param {Object} name
     * @param {Object} value
     * @param {Object} days
     */
    u.setCookie = function(name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        } else
            var expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
    };

    u.getCookie = function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ')
            c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0)
                return c.substring(nameEQ.length, c.length);
        }
        return null;
    };

    u.deleteCookie = function(name) {
        this.setCookie(name, "", -1);
    };

    // TODO mutual information for 2 vectors of numbers

    /**
     * normalize a vector. assumes positive numerical values with minimum value 0.
     * @param {Object} vector
     */
    u.getNormalizedVector = function(vector) {
        var normalized = [];
        var min = jStat.min(vector);
        var max = jStat.max(vector);

        if ((min < 0) || (max == 0)) {
            console.log('min:' + min + '\tmax:' + max);
            if (min < 0) {
                return null;
            } else if (max == 0) {
                return vector;
            }
        }

        for (var i = 0; i < vector.length; i++) {
            var newVal = vector[i] / max;
            normalized.push(newVal);
        }

        return normalized;
    };

    /**
     * Marginal entropy for finite sample (H(X)).
     */
    u.computeMarginalEntropy = function(vector, d3histFunc) {
        var sum = 0;
        var counts = [];

        var d3histObj = d3histFunc(vector);

        // counts
        for (var i = 0; i < d3histObj.length; i++) {
            var bin = d3histObj[i];
            var binCount = bin.length;
            counts.push({
                'bin' : i,
                'count' : binCount
            });
        }

        // probability
        for (var i = 0; i < counts.length; i++) {
            var data = counts[i];
            data.probability = data.count / vector.length;
            data.prod = (data.probability == 0 ) ? 0 : (data.probability * Math.log2(data.probability));

            sum = sum + data.prod;
        }

        sum = -1 * sum;
        return sum;
    };

    /**
     * Joint entropy of 2 events (H(X,Y)).
     */
    u.computeJointEntropy = function(vector1, vector2, d3histFunc) {
        if (vector1.length != vector2.length) {
            return null;
        }
        /**
         * Get the bin index of a value in the d3histObj.
         */
        var getBinIndex = function(d3histObj, val) {
            var binIndex = null;
            for (var i = 0; i < d3histObj.length; i++) {
                var bin = d3histObj[i];
                if ((val >= bin.x) && (val < (bin.x + bin.dx))) {
                    binIndex = i;
                    continue;
                }
            }
            if (binIndex == null) {
                var bin = d3histObj[d3histObj.length - 1];
                if (val - bin.x - bin.dx < bin.dx) {
                    binIndex = d3histObj.length - 1;
                }
            }
            return binIndex;
        };

        var hist1 = d3histFunc(vector1);
        var hist2 = d3histFunc(vector2);

        // init frequency table
        var freqTable = {};
        for (var i = 0; i < hist1.length; i++) {
            for (var j = 0; j < hist2.length; j++) {
                var key = i + '_' + j;
                freqTable[key] = 0;
            }
        }

        // fill in frequency table
        // iterate over sample index
        for (var i = 0; i < vector1.length; i++) {
            var xi = vector1[i];
            var binXi = getBinIndex(hist1, xi);

            var yi = vector2[i];
            var binYi = getBinIndex(hist2, yi);

            var key = binXi + '_' + binYi;
            freqTable[key]++;
        }

        // compute sum over table
        var sum = 0;
        var keys = u.getKeys(freqTable);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var probability = freqTable[key] / vector1.length;
            var product = (probability == 0 ) ? 0 : (probability * Math.log2(probability));
            sum = sum + product;
        }

        sum = -1 * sum;
        return sum;
    };

    /**
     * Compute mutual information from empirical entropy.  I(X;Y) = H(X) + H(Y) - H(X,Y)
     * @param {Object} vector1  Vector of numerical values.
     * @param {Object} vector2
     * @param {Object} numBins  Optional parameter to specify number of bins for binning step. Defaults to vector length.
     */
    u.mutualInformation = function(vector1, vector2, numBins) {
        var mi = null;
        var numBins = ( typeof numBins === 'undefined') ? vector1.length : numBins;

        var d3Hist = d3.layout.histogram().bins(numBins).frequency(false);

        var Hx = u.computeMarginalEntropy(vector1, d3Hist);
        var Hy = u.computeMarginalEntropy(vector2, d3Hist);
        var Hxy = u.computeJointEntropy(vector1, vector2, d3Hist);

        // console.log('Hx', Hx);
        // console.log('Hy', Hy);
        // console.log('Hxy', Hxy);

        mi = Hx + Hy - Hxy;
        return mi;
    };

})(utils);

// console.log('utils', utils);
/**
 * chrisw@soe.ucsc.edu
 * 12AUG14
 * OD_eventData.js defines an event object that is to be used with Observation Deck.
 */

var eventData = eventData || {};
(function(ed) {"use strict";
    ed.OD_eventAlbum = function() {
        // ordinal score assignments to be saved in this object
        this.ordinalScoring = {
            "mutation impact" : {
                "MIN" : -1,
                "MODIFIER" : -0.3,
                "MODERATE" : 1,
                "HIGH" : 2
            }
        };

        this.album = {};

        /**
         * map a datatype to its ID suffix
         */
        this.datatypeSuffixMapping = {};

        /**
         * keys:
         * event is the event that this pivot is scored on, could be something like expression, mutation, contrast, etc.
         * scores is a dictionary keying eventIds to a score
         *
         */
        this.pivot = {};

        this.getSuffixedEventId = function(name, datatype) {
            var suffix = ( datatype in this.datatypeSuffixMapping) ? this.datatypeSuffixMapping[datatype] : "";
            return name + suffix;
        };

        this.addEvent = function(metadataObj, data) {
            var newEvent = new ed.OD_event(metadataObj);
            this.album[metadataObj['id']] = newEvent;

            if (("datatype" in metadataObj) && ("geneSuffix" in metadataObj)) {
                this.datatypeSuffixMapping[metadataObj["datatype"]] = metadataObj["geneSuffix"];
            }

            // add data
            var isNumeric = ((metadataObj['allowedValues'] == 'numeric') || metadataObj['allowedValues'] == 'expression');
            newEvent.data.setData(data, isNumeric);

            // return this;
            return newEvent;
        };

        this.deleteEvent = function(eventId) {
            delete this.album[eventId];
        };

        /**
         * Get all of the eventIds in the album.
         */
        this.getAllEventIds = function() {
            var result = [];
            var groupedEvents = this.getEventIdsByType();
            for (var group in groupedEvents) {
                var events = groupedEvents[group];
                result = result.concat(events);
            }
            return result;
        };

        /**
         * Get the eventIds grouped by datatype.
         */
        this.getEventIdsByType = function() {
            var groupedEventIds = {};
            var eventIdList = utils.getKeys(this.album);
            for (var i = 0; i < eventIdList.length; i++) {
                var eventId = eventIdList[i];
                var datatype = this.getEvent(eventId).metadata.datatype;
                if (!utils.hasOwnProperty(groupedEventIds, datatype)) {
                    groupedEventIds[datatype] = [];
                }
                groupedEventIds[datatype].push(eventId);
            }
            return groupedEventIds;
        };

        /**
         * Get all of the event data for specified samples.
         */
        this.getEventData = function(sampleIds) {
            var result = {};
            // iter over eventIds
            var eventIdList = utils.getKeys(this.album);
            for (var i = 0; i < eventIdList.length; i++) {
                var eventId = eventIdList[i];
                var eventData = this.getEvent(eventId).data;
                // grab data for sample IDs
                var data = eventData.getData(sampleIds);
                result[eventId] = data;
            }
            return result;
        };

        /**
         * Get all of the event data in a list of objects.  Each object has keys: eventId, id, val.
         */
        this.getAllDataAsList = function() {
            var allDataList = [];
            var allDataObj = this.getEventData();
            var eventNameList = utils.getKeys(allDataObj);
            for (var i = 0; i < eventNameList.length; i++) {
                var eventName = eventNameList[i];
                var eventData = allDataObj[eventName].slice();
                for (var j = 0; j < eventData.length; j++) {
                    eventData[j]['eventId'] = eventName;
                }
                allDataList = allDataList.concat(eventData);
            }
            return allDataList;
        };

        /**
         * Get all of the sample IDs in album.
         */
        this.getAllSampleIds = function() {
            var sampleIds = [];
            var eventIdList = utils.getKeys(this.album);
            for (var i = 0; i < eventIdList.length; i++) {
                var eventId = eventIdList[i];
                var eventSampleIds = this.getEvent(eventId).data.getAllSampleIds();
                sampleIds = sampleIds.concat(eventSampleIds);
            }
            return utils.eliminateDuplicates(sampleIds);
        };

        /**
         * Select samples that meet the criteria.
         */
        this.selectSamples = function(selectionCriteria) {
            var ids = this.getAllSampleIds();
            if (selectionCriteria.length == 0) {
                return ids;
            }
            for (var i in selectionCriteria) {
                var eventId = selectionCriteria[i]["eventId"];
                var value = selectionCriteria[i]["value"];

                // select IDs from event data
                ids = this.getEvent(eventId).data.selectIds(value, ids);
            }
            return ids;
        };
        /**
         * Get the specified event from the album.
         */
        this.getEvent = function(eventId) {
            var e = this.album[eventId];
            if ( typeof e === "undefined") {
                console.log("getEvent got undefined eventObj for: " + eventId);
            }
            return e;
        };

        /**
         * recursive function to get all children IDs.
         */
        this.getAllChildren = function(idList, inputChildrenList) {
            var childList = ( typeof inputChildrenList === "undefined") ? [] : inputChildrenList;

            // collect children
            var currentChildren = [];
            for (var i = 0; i < idList.length; i++) {
                var id = idList[i];
                var currentMetadata = this.getEvent(id).metadata;
                currentChildren = currentChildren.concat(getKeys(currentMetadata.children));
            }

            // recurse on children
            if (currentChildren.length == 0) {
                return childList;
            } else {
                var newChildList = childList.concat(currentChildren);
                return this.getAllChildren(currentChildren, newChildList);
            }
        };

        /**
         * pivotScores is a dictionary keying eventIds to some score.
         *
         */
        this.setPivotScores_dict = function(pivotEvent, pivotScoresDict) {
            // TODO currently loaded in as an array of {gene,weight} objects
            if (pivotScoresDict == null) {
                this.pivot = {};
            } else {
                this.pivot = {
                    'event' : pivotEvent,
                    'scores' : pivotScoresDict
                };

            }
            console.log("pivot dict", this.pivot);
            return this;
        };

        /**
         * pivotScores is array of {eventId1,eventId2,score}.
         *
         */
        this.setPivotScores_array = function(pivotEvent, pivotScores) {
            if (pivotScores == null) {
                this.pivot = {};
            } else {
                pivotScores = pivotScores.sort(utils.sort_by('score'));
                this.pivot = {
                    'event' : pivotEvent,
                    'scores' : pivotScores
                };
            }
            console.log("pivot array", this.pivot);
            return this;
        };

        /**
         * Get a sorted list of events by pivot score.  Returns a list of objects with keys: "key" and "val".
         */
        this.getPivotSortedEvents = function(pEventId) {
            if (( typeof this.pivot.scores === 'undefined') || (this.pivot.scores == null)) {
                console.log('getPivotSortedEvents found no pivot scores');
                return [];
            }
            var sortedEvents = [];
            var recordedEvents = {};
            _.each(this.pivot.scores, function(scoreObj) {
                var eventId1 = scoreObj['eventId1'];
                var eventId2 = scoreObj['eventId2'];
                var score = scoreObj['score'];

                var key;
                var val = score;
                console.log("pEventId", pEventId);
                pEventId = pEventId.replace(/_mRNA$/, "");
                pEventId = pEventId.replace(/_mutation$/, "");
                if (eventId1 === pEventId) {
                    key = eventId2;
                } else if (eventId2 === pEventId) {
                    key = eventId1;
                } else {
                    // filter by pEventId
                    return;
                }

                if (utils.hasOwnProperty(recordedEvents, key)) {
                    // duplicate event
                    return;
                }

                sortedEvents.push({
                    "key" : key,
                    "val" : parseFloat(val)
                });

                recordedEvents[key] = 1;
            });
            sortedEvents = sortedEvents.sort(utils.sort_by('val'));
            return sortedEvents;
        };

        /**
         * Get pivot sorted events organized by datatype.
         */
        this.getGroupedPivotSorts = function(pEventId) {
            console.log('getGroupedPivotSorts');
            var result = {};

            // Extract the gene symbols. They are without suffix.
            pEventId = pEventId.replace(/_mRNA$/, "");
            var pivotSortedEventObjs = this.getPivotSortedEvents(pEventId);

            var pivotSortedEvents = [];
            _.each(pivotSortedEventObjs, function(pivotSortedEventObj) {
                pivotSortedEvents.push(pivotSortedEventObj['key']);
            });

            // iterate through datatypes
            var groupedEvents = this.getEventIdsByType();
            var orderedDatatypes = getOrderedDatatypes(_.keys(groupedEvents));

            // preferred order of submatrices
            _.each(orderedDatatypes, function(datatype) {
                var orderedEvents = [];

                // suffixed ids here
                var unorderedEvents = groupedEvents[datatype];

                // no pivot sorted events available
                if (pivotSortedEvents.length == 0) {
                    console.log('pivotSortedEvents.length == 0 for ' + datatype);
                    result[datatype] = unorderedEvents;
                    return;
                }

                // add scored events in the datatype
                _.each(pivotSortedEvents, function(eventId) {
                    var eventId = this.getSuffixedEventId(eventId, datatype);
                    if (utils.isObjInArray(unorderedEvents, eventId)) {
                        orderedEvents.push(eventId);
                    }
                }, this);

                // add the unscored events from the datatype group
                orderedEvents = orderedEvents.concat(unorderedEvents);
                orderedEvents = utils.eliminateDuplicates(orderedEvents);

                result[datatype] = orderedEvents;
            }, this);

            return result;
        };

        /**
         * Get all pivot scores for each pivot in a datatype.
         */
        this.getAllPivotScores = function(datatype, scoringAlgorithm) {
            var allPivotScores = {};

            var groupedEvents = this.getEventIdsByType();
            if (! utils.hasOwnProperty(groupedEvents, datatype)) {
                return allPivotScores;
            }

            var events = groupedEvents[datatype];
            for (var i = 0; i < events.length; i++) {
                var pivotEvent = events[i];
                var scores = this.pivotSort(pivotEvent, scoringAlgorithm);
                allPivotScores[pivotEvent] = scores;
            }

            return allPivotScores;
        };

        /**
         * Place the datatypes into a preferred ordering for viz
         */
        var getOrderedDatatypes = function(datatypes) {
            var preferredOrdering = ["clinical data", "expression data", "mutation call", "mutation impact score", "gistic_copy_number", "kinase target activity", "tf target activity", "expression signature", "mvl drug sensitivity", "datatype label"];

            // expected datatypes
            var list1 = _.filter(preferredOrdering, function(datatype) {
                return _.contains(datatypes, datatype);
            });

            // unexpected datatypes
            var list2 = _.reject(datatypes, function(datatype) {
                return _.contains(preferredOrdering, datatype);
            });

            var orderedDatatypes = list1.concat(list2);
            return orderedDatatypes;
        };

        /**
         * multi-sorting of events
         */
        this.multisortEvents = function(rowSortSteps, colSortSteps) {
            console.log('multisortEvents');
            console.log('rowSortSteps', rowSortSteps);
            console.log('colSortSteps', colSortSteps);
            // default ordering
            var groupedEvents = this.getEventIdsByType();
            console.log("groupedEvents", groupedEvents);

            var orderedDatatypes = getOrderedDatatypes(_.keys(groupedEvents));

            var eventList = [];
            _.each(orderedDatatypes, function(datatype) {
                if (datatype === 'datatype label') {
                    return;
                }
                // add datatype row labels to datatype event lists
                var datatypeEventList = groupedEvents[datatype];
                datatypeEventList.unshift(datatype + "(+)");
                datatypeEventList.push(datatype + "(-)");
                eventList = eventList.concat(datatypeEventList);
            });

            // bubble up colSort events
            var bubbledUpEvents = [];
            if (colSortSteps != null) {
                // bring sorting rows up to top
                var steps = colSortSteps.getSteps();
                for (var b = 0; b < steps.length; b++) {
                    var step = steps[b];
                    var eventId = step['name'];
                    bubbledUpEvents.push(eventId);
                }
                bubbledUpEvents.reverse();
            }
            var rowNames = bubbledUpEvents.slice(0);

            // fill in rest of the list
            rowNames = rowNames.concat(eventList);
            rowNames = utils.eliminateDuplicates(rowNames);

            if (rowSortSteps != null) {
                var steps = rowSortSteps.getSteps().reverse();
                for (var b = 0; b < steps.length; b++) {
                    var step = steps[b];
                    var eventId = step['name'];
                    var reverse = step['reverse'];
                    var eventObj = this.getEvent(eventId);
                    var datatype = eventObj.metadata.datatype;
                    var scoredDatatype = eventObj.metadata.scoredDatatype;

                    // var datatypeSuffix = this.datatypeSuffixMapping[scoredDatatype];

                    if (scoredDatatype == null) {
                        console.log("no scored datatype to sort");
                        continue;
                    }

                    var orderedGeneList = eventObj.metadata.sortSignatureVector();
                    if (reverse) {
                        orderedGeneList.reverse();
                    }

                    var eventGroupEventIds;
                    if (utils.hasOwnProperty(groupedEvents, scoredDatatype)) {
                        eventGroupEventIds = groupedEvents[scoredDatatype].slice(0);
                    } else {
                        console.log(scoredDatatype + " group has no events");
                        continue;
                    }

                    var processedExpressionEventList = [];
                    var scoredEventSigWeightOverlap = [];
                    for (var c = 0; c < orderedGeneList.length; c++) {
                        var orderedGene = orderedGeneList[c];
                        // var orderedGene_eventId = orderedGene + datatypeSuffix;
                        var orderedGene_eventId = this.getSuffixedEventId(orderedGene, scoredDatatype);
                        var index = eventGroupEventIds.indexOf(orderedGene_eventId);
                        if (index >= 0) {
                            // events that are in signature weight vector AND datatype group
                            scoredEventSigWeightOverlap.push(orderedGene_eventId);
                        }
                        if ((index >= 0) && (!utils.isObjInArray(bubbledUpEvents, orderedGene_eventId))) {
                            // only add scored events that have records in the event album
                            processedExpressionEventList.push(orderedGene_eventId);
                            delete eventGroupEventIds[index];
                        }

                        if (utils.isObjInArray(bubbledUpEvents, orderedGene_eventId)) {
                            // skip bubbled up scored events
                            delete eventGroupEventIds[index];
                        }
                    }
                    console.log("scoredEventSigWeightOverlap", (scoredEventSigWeightOverlap.length), scoredEventSigWeightOverlap);

                    // add events that did not appear in signature
                    for (var d in eventGroupEventIds) {
                        processedExpressionEventList.push(eventGroupEventIds[d]);
                    }

                    // assemble all datatypes together
                    var eventList = bubbledUpEvents.slice(0);

                    _.each(orderedDatatypes, function(datatype) {
                        if (datatype === scoredDatatype) {
                            eventList = eventList.concat(processedExpressionEventList);
                        } else {
                            var datatypeEventList = groupedEvents[datatype];
                            for (var i in datatypeEventList) {
                                var eventId = datatypeEventList[i];
                                if (utils.isObjInArray(eventList, eventId)) {
                                    // skip
                                } else {
                                    eventList.push(eventId);
                                }
                            }
                        }
                    });

                    rowNames = eventList;
                    console.log('rowNames.length', rowNames.length, rowNames);

                    // only do this for the first step
                    break;
                }
            }

            return rowNames;
        };

        /**
         * If sortingSteps is null, then just return the sampleIds without sorting.
         */
        this.multisortSamples = function(sortingSteps) {
            var sampleIds = this.getAllSampleIds();
            if (sortingSteps == null) {
                console.log("multisortSamples got null steps");
                return sampleIds;
            }
            console.log("multisortSamples using steps:", sortingSteps.getSteps());
            var steps = sortingSteps.getSteps().slice();
            steps.reverse();

            var album = this;

            sampleIds.sort(function(a, b) {
                // begin sort function
                var comparisonResult = 0;
                // iterate over sorting steps in order
                for (var i = 0; i < steps.length; i++) {
                    // get this step's values
                    var eventId = steps[i]['name'];
                    if ( typeof eventId === "undefined") {
                        continue;
                    }
                    var reverse = steps[i]['reverse'];
                    var eventObj = album.getEvent(eventId);
                    if ((eventObj == undefined) || (eventObj == null)) {
                        for (var key in album.datatypeSuffixMapping) {
                            var newId = eventId + album.datatypeSuffixMapping[key];
                            eventObj = album.getEvent(newId);
                            if ((eventObj != undefined) && (eventObj != null)) {
                                // console.log("use " + newId + " for " + eventId);
                                eventId = newId;
                                break;
                            }
                        }
                        if ((eventObj == undefined) || (eventObj == null)) {
                            console.log('no event found for sorting: ' + eventId);
                            continue;
                        }
                    }
                    var allowedValues = eventObj.metadata['allowedValues'];

                    var vals = eventObj.data.getData([a, b]);
                    var valA = vals[0]['val'];
                    var valB = vals[1]['val'];

                    // select correct comparator
                    var comparator = null;
                    if (allowedValues == 'numeric') {
                        comparator = utils.compareAsNumeric;
                    } else if (allowedValues == 'categoric') {
                        comparator = utils.compareAsString_medbook;
                    } else if (allowedValues == 'expression') {
                        comparator = utils.compareAsNumeric;
                    } else if (allowedValues == 'date') {
                        comparator = utils.compareAsDate;
                    } else {
                        comparator = utils.compareAsString_medbook;
                    }

                    // compare this step's values
                    comparisonResult = comparator(valA, valB);

                    // numeric events sort large to small by default
                    if (comparator == utils.compareAsNumeric) {
                        comparisonResult = comparisonResult * -1;
                    }

                    if (reverse) {
                        comparisonResult = comparisonResult * -1;
                    }

                    // return final comparison or try next eventId
                    if (comparisonResult == 0) {
                        continue;
                    } else {
                        break;
                    }

                }
                return comparisonResult;
                // end sort function
            });

            return sampleIds;
        };

        /**
         * rescale by z-score over each eventId
         */
        this.zScoreExpressionRescaling = function() {
            console.log('zScoreExpressionRescaling');

            // get expression events
            var allEventIds = this.getEventIdsByType();
            if (!utils.hasOwnProperty(allEventIds, 'expression data')) {
                console.log('no expression');
                return null;
            }
            var expressionEventIds = allEventIds['expression data'];

            // compute average expression each gene
            var stats = {};
            var result = {
                'stats' : stats
            };

            var allAdjustedVals = [];

            for (var i = 0; i < expressionEventIds.length; i++) {
                var eventId = expressionEventIds[i];

                // get mean and sd
                var eventStats = this.getEvent(eventId).data.getStats();
                stats[eventId] = {};
                stats[eventId] = eventStats;

                // finally iter over all samples to adjust score
                var allEventData = this.getEvent(eventId).data.getData();
                for (var k = 0; k < allEventData.length; k++) {
                    var data = allEventData[k];
                    if (utils.hasOwnProperty(data, 'val_orig')) {
                        data['val'] = data['val_orig'];
                    }
                    var val = data['val'];
                    data['val_orig'] = val;
                    if (utils.isNumerical(val)) {
                        var z = (val - stats[eventId]['mean']) / (stats[eventId]['sd']);
                        data['val'] = z;
                        allAdjustedVals.push(data['val']);
                    }
                }
            }

            // find min/max of entire expression matrix
            result['maxVal'] = jStat.max(allAdjustedVals);
            result['minVal'] = jStat.min(allAdjustedVals);

            return result;
        };

        /**
         *  Rescale expression data.

         */
        this.betweenMeansExpressionRescaling = function(clinicalEventId, category1, category2) {
            console.log('betweenMeansExpressionRescaling', clinicalEventId, category1, category2);
            // get group sample IDs
            var group1SampleIds = this.getEvent(clinicalEventId).data.selectIds(category1);

            var group2SampleIds = null;
            if (category2 == null) {
                group2SampleIds = this.getEvent(clinicalEventId).data.selectIds(category2);
                group2SampleIds = group2SampleIds.concat(group1SampleIds);
                group2SampleIds = utils.eliminateDuplicates(group2SampleIds);
            } else {
                group2SampleIds = this.getEvent(clinicalEventId).data.selectIds(category2);
            }

            // get expression events
            var allEventIds = this.getEventIdsByType();
            if (!utils.hasOwnProperty(allEventIds, 'expression data')) {
                console.log('no expression');
                return null;
            }
            var expressionEventIds = allEventIds['expression data'];

            // compute average expression of groups over each gene
            var meanVals = {};
            var result = {
                'meanVals' : meanVals
            };

            var allAdjustedVals = [];

            for (var i = 0; i < expressionEventIds.length; i++) {
                var eventId = expressionEventIds[i];
                meanVals[eventId] = {};
                meanVals[eventId]['group1'] = this.getEvent(eventId).data.getStats(group1SampleIds)['mean'];
                meanVals[eventId]['group2'] = this.getEvent(eventId).data.getStats(group2SampleIds)['mean'];

                // finally iter over all samples to adjust score
                var adjustment = (meanVals[eventId]['group2'] - meanVals[eventId]['group1']) / 2;
                var allEventData = this.getEvent(eventId).data.getData();
                for (var k = 0; k < allEventData.length; k++) {
                    var data = allEventData[k];
                    if (utils.hasOwnProperty(data, 'val_orig')) {
                        data['val'] = data['val_orig'];
                    }
                    var val = data['val'];
                    data['val_orig'] = val;
                    if (utils.isNumerical(val)) {
                        data['val'] = val - adjustment;
                        allAdjustedVals.push(data['val']);
                    }
                }
            }

            // find min/max of entire expression matrix
            result['maxVal'] = jStat.max(allAdjustedVals);
            result['minVal'] = jStat.min(allAdjustedVals);

            return result;
        };

        /**
         * Rescale all expression data by subtracting mean of specified group on a per-event basis.  Returns new min/max values.
         */
        this.yuliaExpressionRescaling = function(clinicalEventId, category) {
            console.log('yuliaExpressionRescaling', clinicalEventId, category);
            // get sampleId list of neg group
            var negSampleIds = this.getEvent(clinicalEventId).data.selectIds(category);

            // get expression events
            var allEventIds = this.getEventIdsByType();
            if (!utils.hasOwnProperty(allEventIds, 'expression data')) {
                console.log('no expression');
                return null;
            }
            var expressionEventIds = allEventIds['expression data'];

            // compute average expression of neg group over each gene
            var meanVals = {};
            var result = {
                'meanVals' : meanVals
            };

            var allAdjustedVals = [];

            for (var i = 0; i < expressionEventIds.length; i++) {
                var eventId = expressionEventIds[i];
                meanVals[eventId] = this.getEvent(eventId).data.getStats(negSampleIds)['mean'];

                // second iter over all samples to adjust score
                var allEventData = this.getEvent(eventId).data.getData();
                for (var j = 0; j < allEventData.length; j++) {
                    var data = allEventData[j];
                    if (utils.hasOwnProperty(data, 'val_orig')) {
                        data['val'] = data['val_orig'];
                    }
                    var val = data['val'];
                    data['val_orig'] = val;
                    if (utils.isNumerical(val)) {
                        data['val'] = val - meanVals[eventId];
                        allAdjustedVals.push(data['val']);
                    }
                }
            }

            // find min/max of entire expression matrix
            result['maxVal'] = jStat.max(allAdjustedVals);
            result['minVal'] = jStat.min(allAdjustedVals);

            return result;
        };

        /**
         * for checking if some samples have differential expression
         */
        this.eventwiseMedianRescaling_old = function() {
            console.log('eventwiseMedianRescaling');

            // get expression events
            var allEventIds = this.getEventIdsByType();
            if (!utils.hasOwnProperty(allEventIds, 'expression data')) {
                console.log('no expression');
                return null;
            }
            var expressionEventIds = allEventIds['expression data'];

            // compute average expression each gene
            var stats = {};
            var result = {
                'stats' : stats
            };

            var allAdjustedVals = [];

            for (var i = 0; i < expressionEventIds.length; i++) {
                var eventId = expressionEventIds[i];

                // get stats
                var eventObj = this.getEvent(eventId);
                var eventStats = this.getEvent(eventId).data.getStats();
                stats[eventId] = {};
                stats[eventId] = eventStats;

                // finally iter over all samples to adjust score
                var allEventData = this.getEvent(eventId).data.getData();
                for (var k = 0; k < allEventData.length; k++) {
                    var data = allEventData[k];
                    if (utils.hasOwnProperty(data, 'val_orig')) {
                        data['val'] = data['val_orig'];
                    }
                    var val = data['val'];
                    data['val_orig'] = val;
                    if (utils.isNumerical(val)) {
                        var newVal = (val - stats[eventId]['median']);
                        data['val'] = newVal;
                        allAdjustedVals.push(data['val']);
                    }
                }
            }

            // find min/max of entire expression matrix
            result['maxVal'] = jStat.max(allAdjustedVals);
            result['minVal'] = jStat.min(allAdjustedVals);

            return result;
        };

        this.eventwiseMedianRescaling_events = function(eventIds) {
            // compute average val each gene
            var stats = {};
            var result = {
                'stats' : stats
            };

            var allAdjustedVals = [];

            _.each(eventIds, function(eventId) {
                // get stats
                var eventObj = this.getEvent(eventId);
                var eventStats = this.getEvent(eventId).data.getStats();
                stats[eventId] = {};
                stats[eventId] = eventStats;

                // finally iter over all samples to adjust score
                var allEventData = this.getEvent(eventId).data.getData();

                _.each(allEventData, function(data) {
                    if (utils.hasOwnProperty(data, 'val_orig')) {
                        data['val'] = data['val_orig'];
                    }
                    var val = data['val'];
                    data['val_orig'] = val;
                    if (utils.isNumerical(val)) {
                        var newVal = (val - stats[eventId]['median']);
                        data['val'] = newVal;
                        allAdjustedVals.push(data['val']);
                    }
                });
            }, this);

            // find min/max of entire matrix
            result['maxVal'] = jStat.max(allAdjustedVals);
            result['minVal'] = jStat.min(allAdjustedVals);

            return result;
        };

        /**
         * for checking if some samples have differential expression
         */
        this.eventwiseMedianRescaling = function(datatypesToRescale) {
            console.log('eventwiseMedianRescaling');
            // get expression events
            var allEventIds = this.getEventIdsByType();
            var datatypesToRescale = datatypesToRescale || _.keys(allEventIds);
            var result = {};
            _.each(datatypesToRescale, function(eventType) {
                console.log("eventType", eventType);
                var eventIds = allEventIds[eventType];
                if (this.getEvent(eventIds[0]).metadata.allowedValues === "numeric") {
                    var datatypeResult = this.eventwiseMedianRescaling_events(eventIds);
                    result[eventType] = datatypeResult;
                }
            }, this);
            return result["expression data"];
        };

        /**
         * for checking general expression level of gene
         */
        this.samplewiseMedianRescaling = function() {
            // TODO
            console.log('samplewiseMedianRescaling');

            // get expression events
            var allEventIds = this.getEventIdsByType();
            if (!utils.hasOwnProperty(allEventIds, 'expression data')) {
                console.log('no expression');
                return null;
            }
            var expressionEventIds = allEventIds['expression data'];

            // compute average expression each sample
            var stats = {};
            var result = {
                'stats' : stats
            };

            var allAdjustedVals = [];

            var samples = this.getAllSampleIds();
            for (var i = 0; i < samples.length; i++) {
                var sample = samples[i];
                stats[sample] = {};
                // console.log(sample);
                var sampleEventData = this.getEventData([sample]);
                // console.log(prettyJson(sampleEventData));
                // compute median over expression events
                var sampleVals = [];
                for (var j = 0; j < expressionEventIds.length; j++) {
                    var eventId = expressionEventIds[j];
                    if (utils.hasOwnProperty(sampleEventData, eventId)) {
                        var eventData = sampleEventData[eventId][0];
                        if (eventData['id'] === sample) {
                            if (utils.hasOwnProperty(eventData, 'val_orig')) {
                                eventData['val'] = eventData['val_orig'];
                            }
                            var val = eventData['val'];
                            eventData['val_orig'] = val;
                            if (utils.isNumerical(val)) {
                                sampleVals.push(val);
                                // console.log(sample + "->" + eventId + "->" + val);
                            }
                        }
                    } else {
                        console.log(eventId + ' was not found for ' + sample);
                        continue;
                    }
                }
                // console.log('sampleVals.length for ' + sample + ': ' + sampleVals.length);
                var sampleMed = jStat.median(sampleVals);
                // console.log('expression median for ' + sample + ': ' + sampleMed);
                stats[sample]['samplewise median'] = sampleMed;

                if (isNaN(sampleMed)) {
                    console.log('sample median for ' + sample + ' is NaN.');
                    continue;
                }

                // rescale values over expression events
                for (var j = 0; j < expressionEventIds.length; j++) {
                    var eventId = expressionEventIds[j];
                    if (utils.hasOwnProperty(sampleEventData, eventId)) {
                        var eventData = sampleEventData[eventId][0];
                        if (eventData['id'] === sample) {
                            if (utils.hasOwnProperty(eventData, 'val_orig')) {
                                eventData['val'] = eventData['val_orig'];
                            }
                            var val = eventData['val'];
                            eventData['val_orig'] = val;
                            if (utils.isNumerical(val)) {
                                var newVal = val - stats[sample]['samplewise median'];
                                eventData['val'] = newVal;
                                allAdjustedVals.push(val);
                            }
                        }
                    } else {
                        console.log(eventId + ' was not found for ' + sample);
                        continue;
                    }
                }
            }

            // find min/max of entire expression matrix
            result['maxVal'] = jStat.max(allAdjustedVals);
            result['minVal'] = jStat.min(allAdjustedVals);

            return result;
        };

        /**
         * for checking if a differential expression is in an expressed gene or not
         */
        this.bivariateNormalization = function() {
            // TODO

        };

        /**
         * remove events that have no sample data
         */
        this.removeEmptyEvents = function(maxPercentNull) {
            var threshold = maxPercentNull || 0.99;
            var allEventIdsByCategory = this.getEventIdsByType();
            var emptyEvents = [];
            var categories = utils.getKeys(allEventIdsByCategory);
            for (var i = 0, length = categories.length; i < length; i++) {
                var category = categories[i];
                if (category === "datatype label") {
                    continue;
                }
                for (var j = 0; j < allEventIdsByCategory[category].length; j++) {
                    var eventId = allEventIdsByCategory[category][j];
                    var eventObj = this.getEvent(eventId);
                    var percentNull = eventObj.data.getPercentNullData();
                    if (percentNull >= threshold) {
                        emptyEvents.push(eventId);
                    }
                }
            }
            for (var i = 0, length = emptyEvents.length; i < length; i++) {
                var eventId = emptyEvents[i];
                console.log("empty event:", eventId);
                this.deleteEvent(eventId);
            }
            return null;
        };

        /**
         * Fill in missing samples data with the specified value.
         */
        this.fillInMissingSamples = function(value) {
            // get all sample IDs
            var allAlbumSampleIds = this.getAllSampleIds();

            // get all sample IDs for event
            var allEventIdsByCategory = this.getEventIdsByType();
            for (var i = 0, length = utils.getKeys(allEventIdsByCategory).length; i < length; i++) {
                var category = utils.getKeys(allEventIdsByCategory)[i];
                for (var j = 0; j < allEventIdsByCategory[category].length; j++) {
                    var eventId = allEventIdsByCategory[category][j];
                    var eventData = this.getEvent(eventId).data;
                    var allEventSampleIds = eventData.getAllSampleIds();
                    if (allAlbumSampleIds.length - allEventSampleIds.length == 0) {
                        continue;
                    };

                    // find missing data
                    var missingSampleIds = utils.keepReplicates(allAlbumSampleIds.concat(allEventSampleIds), 2, true);
                    var missingData = {};
                    for (var k = 0; k < missingSampleIds.length; k++) {
                        var id = missingSampleIds[k];
                        if (eventId === "patientSamples") {
                            missingData[id] = "other patient";
                        } else {
                            missingData[id] = value;
                        }
                    }
                    // add data
                    this.getEvent(eventId).data.setData(missingData);
                }
            }
            return this;
        };

        /**
         * NOTE!!! ALL missing sample data will be filled in!
         */
        this.fillInDatatypeLabelEvents = function(value) {
            var allEventIdsByCategory = this.getEventIdsByType();
            var datatypes = utils.getKeys(allEventIdsByCategory);

            var datatypeLabelDatatype = "datatype label";

            for (var i = 0, length = datatypes.length; i < length; i++) {
                var datatype = datatypes[i];

                if (datatype === datatypeLabelDatatype) {
                    continue;
                }

                var pos_suffix = "(+)";
                var neg_suffix = "(-)";

                var eventObj = this.addEvent({
                    'id' : datatype + pos_suffix,
                    'name' : datatype + pos_suffix,
                    'displayName' : datatype + pos_suffix,
                    'description' : null,
                    'datatype' : datatypeLabelDatatype,
                    'allowedValues' : null
                }, {});

                var eventObj_anti = this.addEvent({
                    'id' : datatype + neg_suffix,
                    'name' : datatype + neg_suffix,
                    'displayName' : datatype + neg_suffix,
                    'description' : null,
                    'datatype' : datatypeLabelDatatype,
                    'allowedValues' : null
                }, {});
            }

            this.fillInMissingSamples(value);
        };

        this.getDatatypeNullSamples = function(datatype) {
            var samplesToHide = [];
            try {
                // get eventobjs in datatype
                var eventIdsByType = this.getEventIdsByType();
                var eventTypes = utils.getKeys(eventIdsByType);
                if (utils.isObjInArray(eventTypes, datatype)) {
                    // find samples that are null in all events of the datatype
                    samplesToHide = this.getAllSampleIds();
                    var eventIds = eventIdsByType[datatype];
                    for (var i = 0, length = eventIds.length; i < length; i++) {
                        var eventId = eventIds[i];
                        var eventObj = this.getEvent(eventId);
                        var nullSamples = eventObj.data.getNullSamples();
                        samplesToHide = samplesToHide.concat(nullSamples);
                        samplesToHide = utils.keepReplicates(samplesToHide);
                    }
                }
            } catch (error) {
                console.log('ERROR while getting samples to hide in datatype:', datatype, 'error.message ->', error.message);
            } finally {
                console.log('samplesToHide', samplesToHide);
                return samplesToHide;
            }
        };
    };

    ed.OD_event = function(metadataObj) {
        this.metadata = new ed.OD_eventMetadata(metadataObj);
        this.data = new ed.OD_eventDataCollection();
    };

    ed.OD_eventMetadata = function(obj) {
        this.id = obj['id'];
        this.name = obj['name'];
        this.displayName = obj['displayName'];
        this.description = obj['description'];
        this.datatype = obj['datatype'];
        this.allowedValues = obj['allowedValues'];
        this.minAllowedVal = obj['minAllowedVal'];
        this.maxAllowedVal = obj['maxAllowedVal'];
        this.weightedGeneVector = [];

        this.setScoreRange = function(minAllowed, maxAllowed) {
            this.minAllowedVal = minAllowed;
            this.maxAllowedVal = maxAllowed;
        };

        /**
         * weightVector is an array of objects with keys: 'gene', 'weight'.
         * scoredDatatype is the datatype to which the weights apply.
         */
        this.setWeightVector = function(weightVector, scoredDatatype) {
            this.weightedGeneVector = weightVector;
            this.scoredDatatype = scoredDatatype;
            return this;
        };

        /**
         * For an event that is a signature of weighted genes, sort genes by weight... heaviest at top
         */
        this.sortSignatureVector = function(reverse) {

            /**
             * comparator for weighted gene vector
             */
            var compareWeightedGenes = function(a, b) {
                var weightA = a['weight'];
                var weightB = b['weight'];
                return utils.compareAsNumeric(weightA, weightB);
            };

            var sig = this.weightedGeneVector.slice(0);
            sig.sort(compareWeightedGenes);

            // output sorted list of geness
            var geneList = [];
            for (var i = 0; i < sig.length; i++) {
                geneList.push(sig[i]['gene']);
            }

            if (reverse) {
            } else {
                geneList.reverse();
            }

            return geneList;
        };
    };

    ed.OD_eventDataCollection = function() {
        /**
         * list of sampleData objects with keys: 'id', 'val'.
         */
        this.dataCollection = [];

        function sampleData(id, val) {
            this.id = id;
            this.val = val;
        };

        /**
         * Get the percent of samples that have null data.
         */
        this.getPercentNullData = function() {
            var counts = this.getValueCounts();
            var percentNull = 0;
            if (null in counts) {
                var allSampleIds = this.getAllSampleIds();
                var totalCount = allSampleIds.length;
                var nullCounts = counts[null];
                percentNull = nullCounts / totalCount;
            }
            return percentNull;
        };

        /**
         * get the sample count for each value.  Useful for something like histogram.  Restrict to sample list, if given.
         */
        this.getValueCounts = function(sampleList) {
            var valCounts = {};
            // get sample data
            var dataList = this.getData(sampleList);

            // get the sample count for each value
            for (var i = 0; i < dataList.length; i++) {
                var dataObj = dataList[i];
                var val = dataObj['val'];
                if (!utils.hasOwnProperty(valCounts, val)) {
                    valCounts[val] = 0;
                }
                valCounts[val] = valCounts[val] + 1;
            }
            return valCounts;
        };

        /**
         * Get all data values.
         */
        this.getValues = function(dedup) {
            var valueCounts = this.getValueCounts();
            var vals = utils.getKeys(valueCounts);

            if ((dedup != null) && (dedup == true)) {
                vals = utils.eliminateDuplicates(vals);
            }
            return vals;
        };

        /**
         * dataObj is a dictionary of event values keyed on sampleId
         */
        this.setData = function(dataObj, isNumeric) {
            // this.dataCollection = [];
            for (var sampleId in dataObj) {
                var val = dataObj[sampleId];
                if ((val == "NaN") || (val == "null") || (val == "") || (val == "N/A")) {
                    // skip non-values
                    continue;
                }
                if ((isNumeric != null) && (isNumeric == true)) {
                    val = parseFloat(val);
                }
                this.dataCollection.push(new sampleData(sampleId, val));
            }
            return this;
        };

        /**
         * Order of samples is maintained... allows multi-sort.
         * If a specified ID is not found, then null is used for the value.
         * Restrict to sampleIdList, if given.
         */
        this.getData = function(sampleIdList) {
            // a mapping of sampleId to index
            var allSampleIds = this.getAllSampleIds(true);

            if (sampleIdList == null) {
                sampleIdList = utils.getKeys(allSampleIds);
            }
            var returnData = [];

            for (var i = 0; i < sampleIdList.length; i++) {
                var sampleId = sampleIdList[i];
                // check if sampleId is in allSampleIds
                if ( sampleId in allSampleIds) {
                    var index = allSampleIds[sampleId];
                    var data = this.dataCollection[index];
                    returnData.push(data);
                } else {
                    returnData.push(new sampleData(sampleId, null));
                }
            }
            return returnData;
        };

        /**
         * Get all sampleIds as array.  If indices == true, then return mapping of id to index.
         */
        this.getAllSampleIds = function(indices) {
            var ids = {};
            for (var i = 0; i < this.dataCollection.length; i++) {
                var data = this.dataCollection[i];
                var id = data['id'];
                ids[id] = i;
            }
            if (indices) {
                return ids;
            }
            return utils.getKeys(ids);
        };

        /**
         *Get the sampleIds with null data values
         */
        this.getNullSamples = function(inputIds) {
            var resultIds = [];
            var sampleData = this.getData(inputIds);
            for (var i = 0; i < sampleData.length; i++) {
                var data = sampleData[i];
                if (data['val'] == null) {
                    resultIds.push(data['id']);
                }
            }
            return resultIds;
        };

        /**
         * compare sample scores and return sorted list of sample IDs. If sortType == numeric, then numeric sort.  Else, sort as strings.
         */
        // TODO dead code?
        this.sortSamples = function(sampleIdList, sortType) {
            // sortingData has to be an array
            var sortingData = this.getData(sampleIdList);

            // sort objects
            var comparator = compareSamplesAsStrings;
            if (sortType == null) {
                sortType = 'categoric';
            } else {
                sortType = sortType.toLowerCase();
            }

            if (((sortType == 'numeric') || (sortType == 'expression'))) {
                comparator = compareSamplesAsNumeric;
            } else if (sortType == 'date') {
                comparator = compareSamplesAsDate;
            }
            sortingData.sort(comparator);

            // return row names in sorted order
            var sortedNames = new Array();
            for (var k = 0; k < sortingData.length; k++) {
                sortedNames.push(sortingData[k]['id']);
            }

            return sortedNames;
        };

        /**
         * Select Ids with data that match a value. Restrict to startingIds, if given.
         */
        this.selectIds = function(selectVal, startingIds) {
            var selectedIds = [];

            var allData = (startingIds == null) ? this.getData() : this.getData(startingIds);
            for (var i = 0; i < allData.length; i++) {
                var data = allData[i];
                if (data['val'] == selectVal) {
                    selectedIds.push(data['id']);
                }
            }

            return selectedIds;
        };

        /** *get mean,sd,median,meddev,meandev.  Uses jStat library
         */
        this.getStats = function(sampleIdList, precision) {
            if ( typeof precision === 'undefined') {
                precision = 3;
            }
            var results = {
                'min' : 0,
                'max' : 0,
                'mean' : 0,
                'median' : 0,
                'sd' : 0,
                'meddev' : 0,
                'meandev' : 0,
                'percentNullData' : 0
            };

            results.percentNullData = this.getPercentNullData();
            results.percentNullData = results.percentNullData.toPrecision(precision);
            if (results.percentNullData == 1) {
                return results;
            }

            // a mapping of sampleId to index
            var allSampleIds = this.getAllSampleIds(true);

            if (sampleIdList == null) {
                sampleIdList = utils.getKeys(allSampleIds);
            }

            var vector = [];
            for (var i = 0; i < sampleIdList.length; i++) {
                var sampleId = sampleIdList[i];
                // check if sampleId is in allSampleIds
                if ( sampleId in allSampleIds) {
                    var index = allSampleIds[sampleId];
                    var data = this.dataCollection[index];
                    var val = null;
                    // be sure to use original values
                    if (utils.hasOwnProperty(data, 'val_orig')) {
                        val = data['val_orig'];
                    } else {
                        val = data['val'];
                    }
                    if (utils.isNumerical(val)) {
                        vector.push(val);
                    }
                }
            }

            if (vector.length == 0) {
                return results;
            }

            results['mean'] = jStat.mean(vector).toPrecision(precision);
            results['sd'] = jStat.stdev(vector).toPrecision(precision);
            results['median'] = jStat.median(vector).toPrecision(precision);
            results['meddev'] = jStat.meddev(vector).toPrecision(precision);
            results['meandev'] = jStat.meandev(vector).toPrecision(precision);
            results['min'] = jStat.min(vector).toPrecision(precision);
            results['max'] = jStat.max(vector).toPrecision(precision);

            return results;
        };
    };

    /**
     * Keep track of sorting.
     */
    ed.sortingSteps = function(arrayOfSteps) {
        this.steps = new Array();
        if (arrayOfSteps != null) {
            this.steps = arrayOfSteps;
        }

        this.getSteps = function() {
            return this.steps;
        };

        this.getIndex = function(name) {
            var result = -1;
            for (var i = 0; i < this.steps.length; i++) {
                if (this.steps[i]["name"] == name) {
                    return i;
                }
            }
            return result;
        };

        /**
         * noReverse = true to just bring a step to the front
         */
        this.addStep = function(name, noReverse) {
            var index = this.getIndex(name);
            if (index >= 0) {
                var c = this.steps.splice(index, 1)[0];
                if (!noReverse) {
                    c["reverse"] = !c["reverse"];
                }
                this.steps.push(c);
            } else {
                this.steps.push({
                    "name" : name,
                    "reverse" : false
                });
            }
        };

        this.removeStep = function(name) {
            var index = this.getIndex(name);
            if (index >= 0) {
                this.steps.splice(index, 1);
            }
        };

        this.clearSteps = function() {
            this.steps.splice(0, this.steps.length);
        };
    };

    /**
     * Object to help with selecting sample IDs based on selection criteria.
     */
    ed.sampleSelectionCriteria = function() {
        this.criteria = new Array();

        this.getCriteria = function() {
            return this.criteria;
        };

        this.addCriteria = function(eventId, value) {
            var criteria = {
                "eventId" : eventId,
                "value" : value
            };
            for (var i in this.criteria) {
                if (JSON.stringify(this.criteria[i]) == JSON.stringify(criteria)) {
                    return;
                }
            }
            this.criteria.push(criteria);
        };

        this.removeCriteria = function(eventId, value) {
            for (var i = 0; i < this.criteria.length; i++) {
                if ((this.criteria[i]["eventId"] == eventId) && (this.criteria[i]["value"] == value)) {
                    this.criteria.splice(i, 1);
                    break;
                }
            }
        };

        this.clearCriteria = function() {
            this.criteria.splice(0, this.criteria.length);
        };
    };

})(eventData);
/**
 * chrisw@soe.ucsc.edu
 * 27AUG14
 * medbook_data_load.js is meant to load cBio/medbook data into data objects.
 */

// cBio-Medbook api:
// https://medbook.ucsc.edu/cbioportal/webservice.do?cmd=getClinicalData&case_set_id=prad_wcdt_all
// https://medbook.ucsc.edu/cbioportal/webservice.do?cmd=getMutationData&case_set_id=prad_wcdt_all&genetic_profile_id=prad_wcdt_mutations&gene_list=AKT1+AKT2+RB1+PTEN
// https://medbook.ucsc.edu/cbioportal/webservice.do?cmd=getCaseLists&cancer_study_id=prad_wcdt

// var clinicalDataFileUrl = 'observation_deck/data/cbioMedbook/data_clinical.txt';
// var caseListsFileUrl = 'observation_deck/data/cbioMedbook/getCaseLists.txt';
// var mutationDataFileUrl = 'observation_deck/data/cbioMedbook/mutation.txt';
// var expressionDataFileUrl = 'observation_deck/data/cbioMedbook/expressionData.tab';

var medbookDataLoader = medbookDataLoader || {};

(function(mdl) {"use strict";
    mdl.transposeClinicalData = function(input, recordKey) {
        var transposed = {};
        for (var i = 0; i < input.length; i++) {
            var obj = input[i];
            var case_id = obj[recordKey];
            // delete (obj[recordKey]);
            for (var key in obj) {
                if ( key in transposed) {
                } else {
                    transposed[key] = {};
                }
                transposed[key][case_id] = obj[key];
            }
        }
        return transposed;
    };

    /**
     * The clinical data file looks like this:

     #Sample f1    f2   f3     f4
     #Sample f1    f2   f3     f4
     STRING  STRING  DATE    STRING  STRING
     SAMPLE_ID       f1    f2   f3     f4
     1 UCSF    6/15/2012       Bone    Resistant
     2 UCSF    12/15/2012      Liver   Naive
     3 UCSF    2/26/2013       Liver   Naive
     4 UCSF    2/21/2013       Liver   Naive

     * @param {Object} url
     * @param {Object} OD_eventAlbum
     */
    mdl.getClinicalData = function(url, OD_eventAlbum) {
        var response = utils.getResponse(url);
        var lines = response.split('\n');

        var dataLines = [];
        var commentLines = [];
        var types = [];
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (utils.beginsWith(line, '#')) {
                commentLines.push(line);
            } else if (utils.beginsWith(line, 'STRING')) {
                types = line.split('\t');
            } else {
                dataLines.push(line);
            }
        }

        var parsedResponse = d3.tsv.parse(dataLines.join('\n'));
        var transposed = this.transposeClinicalData(parsedResponse, 'SAMPLE_ID');
        delete transposed['SAMPLE_ID'];

        var eventIdList = utils.getKeys(transposed);
        for (var i = 0; i < eventIdList.length; i++) {
            var eventId = eventIdList[i];
            var clinicalData = transposed[eventId];
            var type = types[i + 1];

            var allowedValues = 'categoric';
            if (type.toLowerCase() == 'number') {
                allowedValues = 'numeric';
            } else if (type.toLowerCase() == 'date') {
                allowedValues = 'date';
            }

            // OD_eventAlbum.addEvent({
            // 'id' : eventId,
            // 'name' : null,
            // 'displayName' : null,
            // 'description' : null,
            // 'datatype' : 'clinical data',
            // 'allowedValues' : allowedValues
            // }, clinicalData);

            mdl.loadEventBySampleData(OD_eventAlbum, eventId, '', 'clinical data', allowedValues, clinicalData);

        }

        return parsedResponse;
    };

    /**
     * The mutation data file is a maf file and looks like this:

     Hugo_Symbol     Entrez_Gene_Id  Center  NCBI_Build
     PEG10   23089   ucsc.edu        GRCh37-lite
     CNKSR3  154043  ucsc.edu        GRCh37-lite
     ANK2    287     ucsc.edu        GRCh37-lite
     ST8SIA4 7903    ucsc.edu        GRCh37-lite
     RUNX1T1 862     ucsc.edu        GRCh37-lite
     GABRB3  2562    ucsc.edu        GRCh37-lite

     * @param {Object} url
     * @param {Object} OD_eventAlbum
     */
    mdl.getMutationData = function(url, OD_eventAlbum) {
        var response = utils.getResponse(url);
        var parsedResponse = d3.tsv.parse(response);

        var dataByGene = {};

        for (var i = 0; i < parsedResponse.length; i++) {
            var parsedData = parsedResponse[i];
            var gene = parsedData['Hugo_Symbol'];
            var classification = parsedData['Variant_Classification'];
            var variantType = parsedData['Variant_Type'];
            var sampleId = parsedData['Tumor_Sample_Barcode'];

            // maf file uses - instead of _
            sampleId = sampleId.replace(/_/g, '-');

            // some samples have trailing [A-Z]
            sampleId = sampleId.replace(/[A-Z]$/, '');

            if (!utils.hasOwnProperty(dataByGene, gene)) {
                dataByGene[gene] = {};
                dataByGene[gene]['metadata'] = {
                    'id' : gene + '_mut',
                    'name' : null,
                    'displayName' : null,
                    'description' : null,
                    'datatype' : 'mutation data',
                    'allowedValues' : 'categoric'
                };
                dataByGene[gene]['data'] = {};
            }

            dataByGene[gene]['data'][sampleId] = true;
        }

        // add mutation events
        var mutatedGenes = utils.getKeys(dataByGene);
        for (var j = 0; j < mutatedGenes.length; j++) {
            var mutatedGene = mutatedGenes[j];
            var mutationData = dataByGene[mutatedGene];
            OD_eventAlbum.addEvent(mutationData['metadata'], mutationData['data']);
        }

        return dataByGene;
    };

    /**
     * The expression data looks like this:

     a b c
     ACOT9   7.89702013149366        4.56919333525263        7.30772632354453
     ADM     9.8457751118653 1       3.92199798893442
     AGR2    14.0603428300693        1       9.25656041315632
     ANG     3.47130453638819        4.56919333525263        6.94655542449336
     ANK2    6.22356349157533        10.7658085407174        12.4021643510831

     * @param {Object} url
     * @param {Object} OD_eventAlbum
     */
    mdl.getExpressionData = function(url, OD_eventAlbum) {
        mdl.getGeneBySampleData(url, OD_eventAlbum, '_mRNA', 'expression data', 'numeric');
    };

    mdl.getViperData = function(url, OD_eventAlbum) {
        mdl.getGeneBySampleData(url, OD_eventAlbum, '_viper', 'viper data', 'numeric');
    };

    /**
     * where the event is a gene
     */
    mdl.getGeneBySampleData = function(url, OD_eventAlbum, geneSuffix, datatype, allowedValues) {
        var response = utils.getResponse(url);
        var parsedResponse = d3.tsv.parse(response);

        for (var eventType in parsedResponse) {
            var data = parsedResponse[eventType];
            var geneId = data[''];
            delete data[''];

            mdl.loadEventBySampleData(OD_eventAlbum, geneId, geneSuffix, datatype, allowedValues, data);
        }
    };

    // TODO loadEventBySampleData
    mdl.loadEventBySampleData = function(OD_eventAlbum, feature, suffix, datatype, allowedValues, data) {
        var eventObj = OD_eventAlbum.addEvent({
            'geneSuffix' : suffix,
            'id' : feature + suffix,
            'name' : datatype + ' for ' + feature,
            'displayName' : feature,
            'description' : null,
            'datatype' : datatype,
            'allowedValues' : allowedValues
        }, data);
        return eventObj;
    };

    /**
     * gaData looks like this:
     {
     "_id": {
     "_str": "56bd09c433cbfe5c8a00ae49"
     },
     "collaborations": [
     "WCDT"
     ],
     "gene_label": "MDM4",
     "sample_label": "DTB-005",
     "study_label": "prad_wcdt",
     "gistic_copy_number": 0.23
     }
     */
    mdl.mongoGeneAnnotationData = function(gaData, OD_eventAlbum) {
        _.each(gaData, function(data) {
            // remove unused fields
            delete data["_id"];
            delete data["collaborations"];
            delete data["study_label"];

            var gene = data["gene_label"];
            delete data["gene_label"];

            var sample = data["sample_label"];
            delete data["sample_label"];

            // remaining keys should be datatypes
            _.each(_.keys(data), function(datatype) {
                var value = data[datatype];

                // get eventObj
                var suffix = "_" + datatype;
                var eventId = gene + suffix;
                var eventObj = OD_eventAlbum.getEvent(eventId);
                // create event if DNE
                if (eventObj == null) {
                    eventObj = mdl.loadEventBySampleData(OD_eventAlbum, eventId, "", datatype, 'numeric', []);
                    eventObj.metadata.displayName = gene;
                }

                // add data to eventObj
                var dataObj = {};
                dataObj[sample] = value;
                eventObj.data.setData(dataObj);
            });
        });
    };

    /**
     * A contrast is one row of clinical data.
     */
    mdl.mongoContrastData = function(contrastData, OD_eventAlbum) {
        if (_.isUndefined(contrastData)) {
            return null;
        }

        // create eventObj
        var eventId = "contrast";
        var eventObj = OD_eventAlbum.getEvent(eventId);

        // add event if DNE
        if (eventObj == null) {
            eventObj = mdl.loadEventBySampleData(OD_eventAlbum, eventId, '', 'clinical data', 'categoric', []);
        }

        // load event data
        var value = contrastData["group1"];
        _.each(contrastData["list1"], function(sampleId) {
            var data = {};
            data[sampleId] = value;
            eventObj.data.setData(data);
        });

        value = contrastData["group2"];
        _.each(contrastData["list2"], function(sampleId) {
            var data = {};
            data[sampleId] = value;
            eventObj.data.setData(data);
        });

        return eventObj;
    };

    /**
     *Add clinical data from mongo collection.
     * @param {Object} collection
     * @param {Object} OD_eventAlbum
     */
    mdl.mongoClinicalData = function(collection, OD_eventAlbum) {
        // iter over doc (each doc = sample)
        for (var i = 0; i < collection.length; i++) {
            var doc = collection[i];

            var sampleId = null;
            // col name for this field has been inconsistent, so try to detect it here
            if (utils.hasOwnProperty(doc, 'sample')) {
                sampleId = doc['sample'];
            } else if (hasOwnProperty(doc, 'Sample')) {
                sampleId = doc['Sample'];
            } else if (hasOwnProperty(doc, 'Patient ID')) {
                sampleId = doc['Patient ID'];
            } else if (hasOwnProperty(doc, 'Patient ID ')) {
                sampleId = doc['Patient ID '];
            } else {
                // no gene identifier found
                console.log('no sample ID found in clinical doc: ' + prettyJson(doc));
                continue;
            }

            sampleId = sampleId.trim();

            // don't use this field
            if ((sampleId === 'Patient ID') || (sampleId === 'Patient ID ')) {
                continue;
            }

            // iter over event names (file columns)
            var keys = utils.getKeys(doc);
            for (var j = 0; j < keys.length; j++) {
                var key = keys[j];
                if (utils.isObjInArray(['_id', 'sample', 'Sample'], key)) {
                    // skip these file columns
                    continue;
                }
                var eventObj = OD_eventAlbum.getEvent(key);

                // add event if DNE
                if (eventObj == null) {
                    eventObj = mdl.loadEventBySampleData(OD_eventAlbum, key, '', 'clinical data', 'categoric', []);
                }
                var value = doc[key];
                var data = {};
                data[sampleId] = value;
                eventObj.data.setData(data);
            }
        }
        return eventObj;
    };

    /**
     * Load a matrix of signature data from a string.
     */
    mdl.genericMatrixData = function(matrixString, dataName, OD_eventAlbum, allowedValues) {
        var parsedMatrix = d3.tsv.parse(matrixString);
        // var allowedValues = "numeric";
        var sanitizedDataName = dataName.replace(/ /, "_");

        var returnFeatures = [];

        _.each(parsedMatrix, function(row) {
            var colNames = _.keys(row);
            var featureKey = colNames.shift();
            var feature = row[featureKey];
            delete row[featureKey];

            if (dataName === "clinical data") {
                mdl.loadEventBySampleData(OD_eventAlbum, feature, "", "clinical data", "categoric", row);
                returnFeatures.push(feature);
            } else {
                mdl.loadEventBySampleData(OD_eventAlbum, feature, "_" + sanitizedDataName, dataName, allowedValues, row);
                returnFeatures = [dataName];
            }
            // mdl.loadEventBySampleData(OD_eventAlbum, feature, "_viper", "viper data", allowedValues, row);
        });
        return returnFeatures;
    };

    /**
     *
     */
    mdl.mongoViperSignaturesData = function(collection, OD_eventAlbum) {
        // iter over doc (each doc = signature)
        for (var i = 0, length = collection.length; i < length; i++) {
            var doc = collection[i];
            var type = doc["type"];
            var algorithm = doc["algorithm"];
            var label = doc["label"];
            var gene_label = doc["gene_label"];

            var sample_values;
            var docKeys = _.keys(doc);
            if (_.contains(docKeys, "sample_values")) {
                sample_values = doc["sample_values"];
            } else if (_.contains(docKeys, "samples")) {
                sample_values = doc["samples"];
            } else {
                console.log("no sample data found", type, algorithm, gene_label);
                continue;
            }

            var sampleData = {};
            for (var j = 0, lengthj = sample_values.length; j < lengthj; j++) {
                var sampleValue = sample_values[j];
                // var patient_label = sampleValue["patient_label"];
                var sample_label = sampleValue["sample_label"];
                var value = sampleValue["value"];

                sampleData[sample_label] = value;
            }

            // TODO version number ??
            var datatype = type + "_" + algorithm;
            var suffix = "_" + datatype;
            var eventId = gene_label + suffix;
            var eventObj = OD_eventAlbum.getEvent(eventId);

            // add event if DNE
            if (eventObj == null) {
                eventObj = mdl.loadEventBySampleData(OD_eventAlbum, gene_label, "_viper", 'viper data', 'numeric', sampleData);
            } else {
                eventObj.data.setData(sampleData);
            }
        }
    };

    /**
     * add patient labels to samples
     */
    mdl.patientSamplesData = function(patientSamplesArray, OD_eventAlbum) {
        var eventName = "patientSamples";
        var dataBySample = {};

        _.each(patientSamplesArray, function(patientSampleObj, index) {
            var patient_label = patientSampleObj["patient_label"];
            var sample_labels = patientSampleObj["sample_labels"];
            _.each(sample_labels, function(sampleId, indexj) {
                dataBySample[sampleId] = patient_label;
            });
        });

        var eventObj = OD_eventAlbum.getEvent(eventName);
        // add event if DNE
        if (eventObj == null) {
            eventObj = mdl.loadEventBySampleData(OD_eventAlbum, eventName, '', 'clinical data', 'categoric', []);
        }
        eventObj.data.setData(dataBySample);
    };

    /**
     *Add expression data from mongo collection.
     * @param {Object} collection
     * @param {Object} OD_eventAlbum
     */
    mdl.mongoExpressionData = function(collection, OD_eventAlbum) {
        // iter over doc (each doc = sample)
        for (var i = 0; i < collection.length; i++) {
            var doc = collection[i];

            // get gene
            var gene = null;
            if (utils.hasOwnProperty(doc, 'gene')) {
                gene = doc['gene'];
            } else if (utils.hasOwnProperty(doc, 'id')) {
                gene = doc['id'];
            } else {
                // no gene identifier found
                console.log('no gene identifier found in expression doc: ' + utils.prettyJson(doc));
                continue;
            }

            gene = gene.trim();
            var suffix = '_mRNA';
            var eventId = gene + suffix;

            // iter over samples
            var samples = utils.getKeys(doc);
            var sampleObjs = doc['samples'];
            // build up sampleData obj
            var sampleData = {};
            for (var sampleId in sampleObjs) {
                var scoreObj = sampleObjs[sampleId];
                var score = scoreObj["rsem_quan_log2"];
                sampleData[sampleId] = score;
            }

            var eventObj = OD_eventAlbum.getEvent(eventId);

            // add event if DNE
            if (eventObj == null) {
                eventObj = mdl.loadEventBySampleData(OD_eventAlbum, gene, suffix, 'expression data', 'numeric', sampleData);
            } else {
                eventObj.data.setData(sampleData);
            }
        }
    };

    /**
     * data about mutation type
     */
    mdl.mongoMutationData = function(collection, OD_eventAlbum) {
        // iter over doc ... each doc is a mutation call
        var allowed_values = "mutation type";

        var impactScoresMap = OD_eventAlbum.ordinalScoring[allowed_values];

        var mutTypeByGene = {};
        var impactScoreByGene = {};
        // for (var i = 0, length = collection.length; i < length; i++) {
        _.each(collection, function(element) {
            var doc = element;

            var sample = doc["sample_label"];
            var gene = doc["gene_label"];
            var type = doc["mutation_type"];
            var sequenceOntology = doc["sequence_ontology"];
            // from http://www.cravat.us/help.jsp?chapter=help_user_account&article=top#sequence_ontology
            // SY	Synonymous Variant
            // SL	Stop Lost
            // SG	Stop Gained
            // MS	Missense Variant
            // II	Inframe Insertion
            // FI	Frameshift Insertion
            // ID	Inframe Deletion
            // FD	Frameshift Deletion
            // CS	Complex Substitution

            // handle sequenceOntology
            if (! _.isUndefined(sequenceOntology)) {
                sequenceOntology = sequenceOntology.toLowerCase();
                if (! utils.hasOwnProperty(mutTypeByGene, gene)) {
                    mutTypeByGene[gene] = {};
                }

                if (! utils.hasOwnProperty(mutTypeByGene[gene], sample)) {
                    mutTypeByGene[gene][sample] = [];
                }

                var findResult = _.findWhere(mutTypeByGene[gene][sample], sequenceOntology);
                if (_.isUndefined(findResult)) {
                    mutTypeByGene[gene][sample].push(sequenceOntology);
                }
            }
            // handle impact score
            var impact_assessor = (_.contains(_.keys(doc), "mutation_impact_assessor")) ? doc["mutation_impact_assessor"] : null;
            if (!_.isNull(impact_assessor) && impact_assessor.toLowerCase() === "chasm") {
                var chasmScore = doc["chasm_driver_score"];

                if (_.isUndefined(impactScoreByGene[gene])) {
                    impactScoreByGene[gene] = {};
                }

                if (_.isUndefined(impactScoreByGene[gene][sample])) {
                    impactScoreByGene[gene][sample] = 1;
                }

                if (impactScoreByGene[gene][sample] > chasmScore) {
                    impactScoreByGene[gene][sample] = chasmScore;
                }
            } else {
                console.log("NO CHASM for", sample, gene);
            }
        });
        console.log("mutTypeByGene", mutTypeByGene);
        console.log("impactScoreByGene", impactScoreByGene);

        // mutation type - add to event album
        var suffix = "_mutation";
        _.each(_.keys(mutTypeByGene), function(gene) {
            var sampleData = mutTypeByGene[gene];
            mdl.loadEventBySampleData(OD_eventAlbum, gene, suffix, 'mutation call', allowed_values, sampleData);
        });

        // mutation impact
        suffix = "_mutation_impact_score";
        allowed_values = "chasm";
        _.each(_.keys(impactScoreByGene), function(gene) {
            var sampleData = impactScoreByGene[gene];
            mdl.loadEventBySampleData(OD_eventAlbum, gene, suffix, 'mutation impact score', allowed_values, sampleData);
        });

        return null;
    };

    /**
     * data about mutation type
     */
    mdl.mongoMutationData_old = function(collection, OD_eventAlbum) {
        // iter over doc ... each doc is a mutation call
        var allowed_values = "mutation type";

        var impactScoresMap = OD_eventAlbum.ordinalScoring[allowed_values];

        var mutByGene = {};
        // for (var i = 0, length = collection.length; i < length; i++) {
        _.each(collection, function(element) {
            var doc = element;

            var sample = doc["sample_label"];
            var gene = doc["gene_label"];
            var type = doc["mutation_type"];
            var impact_assessor = (_.contains(_.keys(doc), "mutation_impact_assessor")) ? doc["mutation_impact_assessor"] : null;

            if (! utils.hasOwnProperty(mutByGene, gene)) {
                mutByGene[gene] = {};
            }

            if (! utils.hasOwnProperty(mutByGene[gene], sample)) {
                mutByGene[gene][sample] = [];
            }

            var findResult = _.findWhere(mutByGene[gene][sample], type);
            if (_.isUndefined(findResult)) {
                mutByGene[gene][sample].push(type);
            }
        });
        console.log("mutByGene", mutByGene);

        // add to event album
        var genes = utils.getKeys(mutByGene);
        var suffix = "_mutation";
        for (var i = 0, length = genes.length; i < length; i++) {
            var gene = genes[i];
            var sampleData = mutByGene[gene];
            mdl.loadEventBySampleData(OD_eventAlbum, gene, suffix, 'mutation call', allowed_values, sampleData);
        }

        return null;
    };

    /**
     * Data about mutation impact
     */
    mdl.mongoMutationData_impact = function(collection, OD_eventAlbum) {
        // iter over doc ... each doc is a mutation call
        var allowed_values = "mutation impact";

        var impactScoresMap = OD_eventAlbum.ordinalScoring[allowed_values];
        var mutByGene = {};
        for (var i = 0, length = collection.length; i < length; i++) {
            var doc = collection[i];

            var sample = doc["sample_label"];
            var gene = doc["gene_label"];
            var type = doc["mutation_type"];
            var impact = doc["effect_impact"];

            if (! utils.hasOwnProperty(mutByGene, gene)) {
                mutByGene[gene] = {};
            }

            // TODO score by greatest impact
            if (! utils.hasOwnProperty(mutByGene[gene], sample)) {
                mutByGene[gene][sample] = impact;
            } else {
                var recordedImpact = mutByGene[gene][sample];
                if (impactScoresMap[impact] > impactScoresMap[recordedImpact]) {
                    mutByGene[gene][sample] = impact;
                } else {
                    continue;
                }
            }
        }

        // add to event album
        var genes = utils.getKeys(mutByGene);
        var suffix = "_mutation";
        for (var i = 0, length = genes.length; i < length; i++) {
            var gene = genes[i];
            var sampleData = mutByGene[gene];
            mdl.loadEventBySampleData(OD_eventAlbum, gene, suffix, 'mutation call', allowed_values, sampleData);
        }

        return null;
    };

    /**
     *Add expression data from mongo collection.
     * @param {Object} collection
     * @param {Object} OD_eventAlbum
     */
    mdl.mongoExpressionData_old = function(collection, OD_eventAlbum) {
        // iter over doc (each doc = sample)
        for (var i = 0; i < collection.length; i++) {
            var doc = collection[i];

            var gene = null;
            if (utils.hasOwnProperty(doc, 'gene')) {
                gene = doc['gene'];
            } else if (utils.hasOwnProperty(doc, 'id')) {
                gene = doc['id'];
            } else {
                // no gene identifier found
                console.log('no gene identifier found in expression doc: ' + utils.prettyJson(doc));
                continue;
            }

            gene = gene.trim();
            var suffix = '_mRNA';
            var eventId = gene + suffix;

            // iter over samples
            var samples = utils.getKeys(doc);
            for (var j = 0; j < samples.length; j++) {
                var sample = samples[j];
                if (utils.isObjInArray(['_id', 'gene', 'id'], sample)) {
                    // skip these 'samples'
                    continue;
                }
                var eventObj = OD_eventAlbum.getEvent(eventId);

                // add event if DNE
                if (eventObj == null) {
                    eventObj = mdl.loadEventBySampleData(OD_eventAlbum, gene, suffix, 'expression data', 'numeric', []);
                }
                var value = doc[sample];
                var data = {};
                data[sample] = parseFloat(value);
                eventObj.data.setData(data);
            }
        }
        return eventObj;
    };

    /**
     *Get a signature via url.  This one does not load sample data.
     * @param {Object} url
     * @param {Object} OD_eventAlbum
     */
    mdl.getSignature = function(url, OD_eventAlbum) {
        var response = utils.getResponse(url);
        var parsedResponse = d3.tsv.parse(response);

        var eventId = url.split('/').pop();

        var eventObj = OD_eventAlbum.getEvent(eventId);

        // add event if DNE
        if (eventObj == null) {
            OD_eventAlbum.addEvent({
                'id' : eventId,
                'name' : null,
                'displayName' : null,
                'description' : null,
                'datatype' : 'expression signature',
                'allowedValues' : 'numeric',
                'weightedGeneVector' : parsedResponse
            }, []);
            eventObj = OD_eventAlbum.getEvent(eventId);
        }
        return eventObj;
    };

    /**
     * Load sample signature scores.
     * @param {Object} obj  mongo collection... an array of {'id':sampleId, 'name':eventId, 'val':sampleScore}
     * @param {Object} OD_eventAlbum
     */
    mdl.loadSignatureObj = function(obj, OD_eventAlbum) {
        var sigScoresMongoDocs = obj;

        // group data by eventID
        var groupedData = {};
        for (var i = 0; i < sigScoresMongoDocs.length; i++) {
            var mongoDoc = sigScoresMongoDocs[i];
            var id = mongoDoc['id'];
            var name = mongoDoc['name'];
            var val = mongoDoc['val'];

            if (! utils.hasOwnProperty(groupedData, name)) {
                groupedData[name] = {};
            }
            groupedData[name][id] = val;
        }

        // set eventData
        var eventIds = utils.getKeys(groupedData);
        for (var i = 0; i < eventIds.length; i++) {
            var eventId = eventIds[i];
            var eventData = groupedData[eventId];

            var datatype;
            var fields = eventId.split('_v');
            var version = fields.pop();
            var rootName = fields.join('_v');
            var suffix = "";
            if (utils.endsWith(rootName, '_kinase_viper')) {
                datatype = 'kinase target activity';
                // suffix = '_kinase_viper';
                // eventId = rootName.replace(suffix,"");
            } else if (utils.endsWith(rootName, '_tf_viper') || utils.beginsWith(rootName, 'tf_viper_')) {
                datatype = 'tf target activity';
                // suffix = '_tf_viper';
                // eventId = rootName.replace(suffix,"");
            } else if (utils.endsWith(rootName, '_mvl_drug_sensitivity') || utils.beginsWith(rootName, 'mvl_drug_sensitivity_')) {
                datatype = 'mvl drug sensitivity';
                // suffix = '_mvl_drug_sensitivity';
                // eventId = rootName.replace(suffix,"");
            } else {
                datatype = 'expression signature';
            }

            var eventObj = OD_eventAlbum.getEvent(eventId);

            // add event if DNE
            if (eventObj == null) {
                eventObj = mdl.loadEventBySampleData(OD_eventAlbum, eventId, suffix, datatype, 'numeric', {});
                eventObj.metadata.setWeightVector([], "expression data");
            }

            eventObj.data.setData(eventData);
        }

    };

    // TODO qqq
    mdl.loadSignatureWeightsObj = function(obj, OD_eventAlbum) {
        // fields: name and version and signature... signature is an obj keyed by gene {'weight':weight,'pval':pval}
        var eventId = obj['name'] + '_v' + obj['version'];

        var datatype;
        if (utils.endsWith(obj['name'], '_kinase_viper')) {
            datatype = 'kinase target activity';
        } else if (utils.endsWith(obj['name'], '_tf_viper') || utils.beginsWith(obj['name'], 'tf_viper_')) {
            datatype = 'tf target activity';
        } else if (utils.endsWith(obj['name'], '_mvl_drug_sensitivity') || utils.beginsWith(obj['name'], 'mvl_drug_sensitivity_')) {
            datatype = 'mvl drug sensitivity';
        } else {
            datatype = "expression signature";
        }

        var eventObj = OD_eventAlbum.getEvent(eventId);

        // weightedGeneVector to be converted to Array of {'gene':gene,'weight':weight}
        var weightedGeneVector = [];
        var signatures = obj['signature'];
        var genes = utils.getKeys(signatures);
        for (var i = 0; i < genes.length; i++) {
            var gene = genes[i];
            var data = signatures[gene];
            weightedGeneVector.push({
                'gene' : gene,
                'weight' : data['weight']
            });
        }

        if (eventObj == null) {
            // create eventObj
            eventObj = mdl.loadEventBySampleData(OD_eventAlbum, eventId, '', datatype, 'numeric', []);
        }
        eventObj.metadata.setWeightVector(weightedGeneVector, 'expression data');
        var size = eventObj.metadata.weightedGeneVector.length;

        return eventObj;
    };

    /**
     * This loader loads signature weights data as sample data.  Events are genes, samples are signatures, data are weights (hopfully, normalized).
     * @param {Object} obj
     * @param {Object} OD_eventAlbum
     */
    mdl.loadBmegSignatureWeightsAsSamples = function(obj, OD_eventAlbum) {
        // build up objects that can be loaded into event album

        // get query genes
        var queryObj = obj['query'];
        var queryGeneList = utils.getKeys(queryObj['weights']);

        // get feature obj
        var featuresObj = obj['features'];
        var featureObjList = [];
        var featureGenes = [];
        for (var feature in featuresObj) {
            var weightiness = featuresObj[feature];
            featureObjList.push({
                "gene" : feature,
                "weight" : weightiness
            });
            featureGenes.push(feature);
        }
        featureGenes = utils.eliminateDuplicates(featureGenes);

        // get signature gene weight data
        var signaturesDict = obj['signatures'];
        var geneWiseObj = {};
        var queryScores = {};

        for (var signatureName in signaturesDict) {
            var signatureObj = signaturesDict[signatureName];
            var score = signatureObj['score'];
            queryScores[signatureName] = score;

            var weights = signatureObj['weights'];
            // var geneList = utils.getKeys(weights);

            var geneList = queryGeneList.slice(0);
            geneList = geneList.concat(utils.getKeys(weights));
            geneList = utils.eliminateDuplicates(geneList);

            for (var j = 0, geneListLength = geneList.length; j < geneListLength; j++) {
                var gene = geneList[j];

                // only keep certain genes
                if ((! utils.isObjInArray(queryGeneList, gene)) && (! utils.isObjInArray(featureGenes, gene))) {
                    continue;
                }
                var weight = weights[gene];
                if ( typeof weight === "undefined") {
                    continue;
                }
                if (! utils.hasOwnProperty(geneWiseObj, gene)) {
                    geneWiseObj[gene] = {};
                }
                geneWiseObj[gene][signatureName] = weight;
            }
        }

        console.log('num genes:' + utils.getKeys(geneWiseObj).length);

        // query score event
        var eventObj = mdl.loadEventBySampleData(OD_eventAlbum, 'query_score', '', 'signature query score', 'numeric', queryScores);
        eventObj.metadata.setWeightVector(featureObjList, "signature weight");

        // load data into event album
        var geneList = utils.getKeys(geneWiseObj);
        for (var i = 0; i < geneList.length; i++) {
            var gene = geneList[i];
            var eventId = gene + "_weight";
            var sigEventObj = OD_eventAlbum.getEvent(eventId);

            if (sigEventObj == null) {
                // create eventObj

                sigEventObj = mdl.loadEventBySampleData(OD_eventAlbum, gene, '_weight', 'signature weight', 'numeric', geneWiseObj[gene]);
                sigEventObj.metadata.setScoreRange(-1, 1);
            } else {
                console.log('loadBmegSignatureWeightsAsSamples:', 'existing event for: ' + eventId);
            }
        }
    };

    /**
     * pivot scores assign a score to events for the purpose of sorting by (anti)correlation.
     * Pivot scores to be loaded into the album as a special object.
     * In medbook-workbench, this is the correlator subscription.
     * @param {Object} obj
     * @param {Object} OD_eventAlbum
     */
    mdl.loadPivotScores = function(collection, OD_eventAlbum) {
        // get a dictionary of {key,val}
        var pivotScores = [];
        for (var i = 0; i < collection.length; i++) {
            var doc = collection[i];

            // get correlated event info and score
            var eventId1 = doc['name_1'];
            var version1 = doc['version_1'];
            var datatype1 = doc['datatype_1'];

            var getEventId = function(name, datatype, version) {
                var newName;
                if (datatype === 'signature') {
                    newName = name + '_v' + version;
                    // } else if (utils.endsWith(name, "_tf_viper")) {
                    // datatype = 'signature';
                    // newName = name.replace('_tf_viper', '');
                    // newName = "tf_viper_" + newName + "_v" + "4";
                } else if (datatype === 'expression') {
                    // no suffix here, just the gene symbol
                    // newName = name + "_mRNA";
                    newName = name;
                } else {
                    newName = name;
                }
                if ( typeof newName === "undefined") {
                    console.log("undefined name for", name, datatype, version);
                }
                return newName;
            };

            eventId1 = getEventId(eventId1, datatype1, version1);

            var eventId2 = doc['name_2'];
            var version2 = doc['version_2'];
            var datatype2 = doc['datatype_2'];

            eventId2 = getEventId(eventId2, datatype2, version2);

            var score = doc['score'];

            // set pivotScoreData
            pivotScores.push({
                'eventId1' : eventId1,
                'eventId2' : eventId2,
                'score' : score
            });

        }
        OD_eventAlbum.setPivotScores_array(null, pivotScores);
    };

})(medbookDataLoader);
/**
 * chrisw@soe.ucsc.edu
 * OCT 2014
 * observation_deck_3.js
 *
 * Development of this data visualization began with the example at: <http://bl.ocks.org/tjdecke/5558084> .
 *
 * This time, avoid using jQuery prototype.
 *
 * requirements:
 * 1) jQuery <https://jquery.com/> ... for jQuery-contextMenu
 * 2) D3.js <http://d3js.org/>
 * 3) jQuery-contextMenu <https://medialize.github.io/jQuery-contextMenu/>
 * 4) jStat
 * 5) utils.js
 * 6) OD_eventData.js
 * 7) typeahead <https://github.com/twitter/typeahead.js>
 */

// expose utils to meteor
u = utils;

// expose observation_deck to meteor
observation_deck = ( typeof observation_deck === "undefined") ? {} : observation_deck;
(function(od) {"use strict";

    var cookieName = "od_config";

    /**
     *  Build an observation deck!
     */
    od.buildObservationDeck = function(containerDivElem, config) {
        // console.log('buildObservationDeck');
        config = getConfiguration(config);

        config['containerDivId'] = containerDivElem.id;

        drawMatrix(containerDivElem, config);

        // set up dialog box
        setupDialogBox("hugoSearch", "HUGO symbol", config["geneQueryUrl"], function(selectedString) {
            var settings = getCookieVal();
            var key = "hugoSearch";
            if (!utils.hasOwnProperty(settings, key)) {
                settings[key] = [];
            }
            settings[key].push(selectedString);
            settings[key] = utils.eliminateDuplicates(settings[key]);
            setCookieVal(settings);

            console.log("settings", settings);

            var sessionGeneList = getSession("geneList");
            console.log("sessionGeneList", sessionGeneList);

            console.log("button clicked in hugoSearch", selectedString);
        });
        setupDialogBox("sigSearch", "signature name", config["sigQueryUrl"], function(selectedString) {
            var settings = getCookieVal();
            var key = "sigSearch";
            if (!utils.hasOwnProperty(settings, key)) {
                settings[key] = [];
            }
            settings[key].push(selectedString);
            settings[key] = utils.eliminateDuplicates(settings[key]);
            setCookieVal(settings);
            console.log("button clicked in sigSearch", selectedString);
        });

        // set up context menu should follow matrix drawing
        setupContextMenus(config);

        return config;
    };

    /**
     *
     */
    var getConfiguration = function(config) {
        // look for od_config in cookies
        var querySettings = getCookieVal();
        config['querySettings'] = querySettings;

        var od_eventAlbum = null;

        // pivot_event is passed to OD from medbook-workbench via session property
        // session property may be null
        if (('pivot_event' in config) && (config['pivot_event'] != null)) {
            var pivotSettings = config['pivot_event'];
            config['querySettings']['pivot_event'] = pivotSettings;
        } else {
            // delete config['querySettings']['pivot_event'];
        }

        // detect pre-configured event album obj
        if ('eventAlbum' in config) {
            od_eventAlbum = config['eventAlbum'];
        } else {
            od_eventAlbum = new eventData.OD_eventAlbum();
            config['eventAlbum'] = od_eventAlbum;
        }

        // data to be retrieved via url
        var dataLoader = medbookDataLoader;

        if ('pivotScores' in config) {
            var pivotScoresData = config['pivotScores'];
            if ('object' in pivotScoresData) {
                dataLoader.loadPivotScores(pivotScoresData['object'], od_eventAlbum);
            }
        }
        delete config['pivotScores'];

        if ('dataUrl' in config) {
            var dataUrlConfig = config['dataUrl'];
            if ('clinicalUrl' in dataUrlConfig) {
                dataLoader.getClinicalData(dataUrlConfig['clinicalUrl'], od_eventAlbum);
            }
            if ('expressionUrl' in dataUrlConfig) {
                dataLoader.getExpressionData(dataUrlConfig['expressionUrl'], od_eventAlbum);
            }
            if ('mutationUrl' in dataUrlConfig) {
                dataLoader.getMutationData(dataUrlConfig['mutationUrl'], od_eventAlbum);
            }
        }

        // data passed in as mongo documents
        if ('mongoData' in config) {
            var mongoData = config['mongoData'];
            // TODO load gene annotation data
            if ("geneAnnotation" in mongoData) {
                dataLoader.mongoGeneAnnotationData(mongoData['geneAnnotation'], od_eventAlbum);
            }
            if ("contrast" in mongoData) {
                dataLoader.mongoContrastData(mongoData['contrast'], od_eventAlbum);
            }
            if ('clinical' in mongoData) {
                dataLoader.mongoClinicalData(mongoData['clinical'], od_eventAlbum);
            }
            if ('expression' in mongoData) {
                dataLoader.mongoExpressionData(mongoData['expression'], od_eventAlbum);
            }
            if ('mutation' in mongoData) {
                dataLoader.mongoMutationData(mongoData['mutation'], od_eventAlbum);
            }
        }
        // delete the data after it has been used to load events
        delete config['mongoData'];

        // signature data
        if ('signature' in config) {
            var signatureConfig = config['signature'];
            if ('expression' in signatureConfig) {
                var expressionSigConfig = signatureConfig['expression'];
                if ('file' in expressionSigConfig) {
                    var fileNames = expressionSigConfig['file'];
                    for (var i = 0; i < fileNames.length; i++) {
                        var fileName = fileNames[i];
                        console.log(fileName);
                        dataLoader.getSignature(fileName, od_eventAlbum);
                    }
                }
                if ('object' in expressionSigConfig) {
                    var objects = expressionSigConfig['object'];
                    for (var i = 0; i < objects.length; i++) {
                        var object = objects[i];
                        dataLoader.loadSignatureObj(object, od_eventAlbum);
                    }
                }
            }
        }
        // delete the data after it has been used to load events
        delete config['signature'];

        // signature gene weights data
        if ('signature_index' in config) {
            var sigIdxConfig = config['signature_index'];
            if ('expression' in sigIdxConfig) {
                var expressionSigIdxConfig = sigIdxConfig['expression'];
                if ('object' in expressionSigIdxConfig) {
                    var objects = expressionSigIdxConfig['object'];
                    for (var i = 0; i < objects.length; i++) {
                        var object = objects[i];
                        dataLoader.loadSignatureWeightsObj(object, od_eventAlbum);
                    }
                }
            }
        }
        // delete the data after it has been used to load events
        delete config['signature_index'];

        // 'bmegSigServiceData' : bmegSigServiceData
        if ('bmegSigServiceData' in config) {
            console.log('bmegSigServiceData in config');
            dataLoader.loadBmegSignatureWeightsAsSamples(config['bmegSigServiceData'], od_eventAlbum);
        }
        // delete the data after it has been used to load events
        delete config['bmegSigServiceData'];

        // specify the samples that should be displayed
        if ('displayedSamples' in config) {
            var displayedSamples = config['displayedSamples'];
        } else {
            config['displayedSamples'] = [];
        }

        var groupedEvents = config['eventAlbum'].getEventIdsByType();
        var eventList = [];
        for (var datatype in groupedEvents) {
            var datatypeEventList = groupedEvents[datatype];
            // console.log('datatype', datatype, 'has', datatypeEventList.length, 'events', '<-- getConfiguration');
        }

        if ('deleteEvents' in config) {
            var deleteEvents = config['deleteEvents'];
            for (var i = 0; i < deleteEvents.length; i++) {
                config['eventAlbum'].deleteEvent(deleteEvents[i]);
            }
        }

        return config;
    };

    /**
     * Get event IDs that are in the cookies.  Currently only gets the expression events.
     * Exposed to meteor via "od."
     */
    od.getCookieEvents = function() {
        var eventList = [];
        var cookieObj = getCookieVal();
        if (( typeof cookieObj === 'undefined') || (cookieObj == null) || ((utils.getKeys(cookieObj)).length == 0)) {
            return [];
        }
        if (utils.hasOwnProperty(cookieObj, 'pivot_sort')) {
            eventList.push(cookieObj['pivot_sort']['pivot_event']);
        }
        if (utils.hasOwnProperty(cookieObj, 'colSort')) {
            var steps = cookieObj['colSort']['steps'];
            for (var i = 0; i < steps.length; i++) {
                var step = steps[i];
                eventList.push(step['name']);
            }
        }
        if (utils.hasOwnProperty(cookieObj, 'hide_null_samples_event')) {
            eventList = eventList.concat(cookieObj['hide_null_samples_event']);
        }

        var geneList = [];
        for (var i = 0; i < eventList.length; i++) {
            var eventId = eventList[i];
            if (utils.endsWith(eventId, '_mRNA')) {
                geneList.push(eventId.replace('_mRNA', ''));
            }
        }

        if (utils.hasOwnProperty(cookieObj, "hugoSearch")) {
            var hugoIds = cookieObj["hugoSearch"];
            geneList = geneList.concat(hugoIds);
        }

        return utils.eliminateDuplicates(geneList);
    };

    /**
     * Set up a dialog box with typeahead functionality
     * config is an obj of {title,placeholder,bloohoundObj}
     */
    var createSuggestBoxDialog = function(suggestBoxConfig) {
        var title = suggestBoxConfig["title"];
        var placeholder = suggestBoxConfig["placeholderText"];

        var divElem = utils.createDivElement(title);
        divElem.style['display'] = 'none';

        var inputElem = document.createElement("input");
        divElem.appendChild(inputElem);
        utils.setElemAttributes(inputElem, {
            // "class" : "typeahead",
            "type" : "text",
            "placeholder" : placeholder
        });

        var buttonElem = document.createElement("button");
        divElem.appendChild(buttonElem);
        utils.setElemAttributes(buttonElem, {
            "type" : "button",
            "style" : "float: right"
        });
        buttonElem.innerHTML = "select";
        buttonElem.onclick = function() {
            suggestBoxConfig["selectionCallback"](inputElem.value);
            $(divElem).dialog("close");
        };

        for (var i = 0; i < 9; i++) {
            divElem.appendChild(document.createElement("br"));
        }

        $(inputElem).typeahead({
            "hint" : true,
            "highlight" : true,
            "minLength" : 2
        }, {
            "name" : "dataset",
            "source" : suggestBoxConfig["bloodhoundObj"],
            "limit" : 99
        });

        return divElem;
    };

    /**
     * Set up a dialog boxes
     */
    var setupDialogBox = function(elementTitle, placeholderText, queryUrl, selectionCallback) {
        var queryVar = "%VALUE";
        var bodyElem = document.getElementsByTagName('body')[0];
        var dialogBox = createSuggestBoxDialog({
            "title" : elementTitle,
            "placeholderText" : placeholderText,
            "bloodhoundObj" : new Bloodhound({
                "datumTokenizer" : Bloodhound.tokenizers.whitespace,
                "queryTokenizer" : Bloodhound.tokenizers.whitespace,
                // "local" : ["abc", "def", "ghi", "abd", "abr"],
                "remote" : {
                    // "url" : "https://su2c-dev.ucsc.edu/wb/genes?q=%QUERY",
                    // "url" : "/genes?q=%VALUE",
                    "url" : queryUrl + queryVar,
                    "wildcard" : queryVar,
                    "transform" : function(response) {
                        console.log("response", response);
                        var items = response["items"];
                        var list = [];
                        for (var i = 0, length = items.length; i < length; i++) {
                            var item = items[i];
                            var id = item["id"];
                            list.push(id);
                        }
                        list = utils.eliminateDuplicates(list);
                        return list;
                    }
                }
            }),
            "selectionCallback" : selectionCallback
        });
        bodyElem.appendChild(dialogBox);
    };

    /*
     *
     */
    var setupContextMenus = function(config) {
        // config['querySettings']
        // first destroy old contextMenus
        var selectors = ['.typeLabel', '.colLabel', '.rowLabel', '.mrna_exp', '.categoric', ".signature"];
        for (var i = 0; i < selectors.length; i++) {
            var selector = selectors[i];
            $.contextMenu('destroy', selector);
        }
        setupTypeLabelContextMenu(config);
        setupColLabelContextMenu(config);
        setupRowLabelContextMenu(config);
        setupCategoricCellContextMenu(config);
        setupExpressionCellContextMenu(config);
        setupSignatureCellContextMenu(config);
    };

    /**
     * delete cookie and reset config
     */
    var resetConfig = function(config) {
        var persistentKeys = ['dataUrl', 'eventAlbum', 'mongoData', 'containerDivId', 'signature', "rowTitleCallback", "columnTitleCallback"];
        utils.deleteCookie('od_config');
        var keys = utils.getKeys(config);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (utils.isObjInArray(persistentKeys, key)) {
                continue;
            } else {
                delete config[key];
            }
        }
        console.log('remaining config', config);
    };

    /**
     * Set the obs-deck cookie. Value is an object that is stringified for the cookie.
     */
    var setCookieVal = function(value) {
        utils.setCookie(cookieName, JSON.stringify(value));
    };

    /**
     * Get the obs-deck cookie. Return empty object if no cookie.s
     */
    var getCookieVal = function() {
        var cookie = utils.getCookie(cookieName);
        var parsedCookie = utils.parseJson(cookie) || {};
        return parsedCookie;
    };

    /**
     * If session object exists, set the key/value pair.
     */
    var setSession = function(key, value) {
        if ( typeof Session !== "undefined") {
            if (key) {
                Session.set(key, value);
            }
            return true;
        } else {
            console.log("no session object for setting");
            return false;
        }
    };

    /**
     * Get session value if exists.  Else, return null.
     */
    var getSession = function(key) {
        var value = null;
        if ( typeof Session !== "undefined") {
            if (key) {
                value = Session.get(key);
            }
        } else {
            console.log("no session object for getting");
        }
        return value;
    };

    /*
     * If session object exists, delete the specified keys.
     *
     */
    var resetSession = function(keys) {
        if ( typeof Session !== "undefined") {
            for (var i = 0, length = keys.length; i < length; i++) {
                delete Session.keys[keys[i]];
            }
            return true;
        } else {
            console.log("no session object to reset");
            return false;
        }
    };

    /**
     * Clear session and cookies and then rebuild the obs-deck
     */
    var resetObsDeck = function(config) {
        console.log("!! RESETTING OBS DECK !!");
        resetConfig(config);
        resetSession(['pivotSettings', "subscriptionPaging", "geneList", "focusGenes", "lockedEvents"]);
        setSession("pivotSettings", "");

        var containerDivElem = document.getElementById(config['containerDivId']);
        var newConfig = od.buildObservationDeck(containerDivElem, config);
    };

    var getDevMode = function() {
        var useDevMode = (utils.getQueryStringParameterByName('dev_mode').toLowerCase() === 'true');
        return useDevMode;
    };

    /**
     * Set session var for datatype paging
     */
    var setDatatypePaging = function(datatype, headOrTail, upOrDown) {
        var sessionVarName = "subscriptionPaging";
        var sessionVal = getSession(sessionVarName);

        // default setting
        if (!sessionVal) {
            sessionVal = {};
        }

        if (!utils.hasOwnProperty(sessionVal, datatype)) {
            sessionVal[datatype] = {
                "head" : 0,
                "tail" : 0
            };
        }

        if (!headOrTail || !upOrDown) {
            return sessionVal[datatype];
        }

        // new setting
        var newVal;
        if (upOrDown === "down") {
            newVal = --sessionVal[datatype][headOrTail];
        } else if (upOrDown === "up") {
            newVal = ++sessionVal[datatype][headOrTail];
        } else if (upOrDown === "0") {
            newVal = sessionVal[datatype][headOrTail] = 0;
        }

        // validate
        if (newVal < 0) {
            sessionVal[datatype][headOrTail] = 0;
        }

        setSession(sessionVarName, sessionVal);
    };

    /**
     *add a sorting step object for the eventId to "rowSort" or "colSort". Defaults to "colSort".
     */
    var addSortStepToCookies = function(eventId, config, sortType, noReverse) {
        // may be rowSort or colSort, default to colSort
        var sortType = sortType || "colSort";
        var noReverse = noReverse || false;

        var sortSteps;
        var querySettings = config['querySettings'];
        if ( sortType in querySettings) {
            sortSteps = new eventData.sortingSteps(querySettings[sortType]["steps"]);
        } else {
            sortSteps = new eventData.sortingSteps();
        }
        sortSteps.addStep(eventId, noReverse);
        querySettings[sortType] = sortSteps;

        setCookieVal(querySettings);
    };

    /**
     * Create a context menu item for use with jQuery-contextMenu.
     */
    var createResetContextMenuItem = function(config) {
        var obj = {
            name : "reset",
            icon : null,
            disabled : false,
            callback : function(key, opt) {
                resetObsDeck(config);
            }
        };
        return obj;
    };

    var setupColLabelContextMenu = function(config) {

        /**
         * callback for medbook-workbench
         */
        // var titleCallback = function(sampleId) {
        // var url = '/wb/patient/' + sampleId;
        // window.open(url, "_self");
        // };

        var titleCallback = config['columnTitleCallback'];

        $.contextMenu({
            // selector : ".axis",
            selector : ".colLabel",
            trigger : 'left',
            build : function($trigger, contextmenuEvent) {
                // https://medialize.github.io/jQuery-contextMenu/demo/dynamic-create.html
                // this callback is executed every time the menu is to be shown
                // its results are destroyed every time the menu is hidden
                // e is the original contextmenu event, containing e.pageX and e.pageY (amongst other data)
                // console.log('dynamic on-demand contextMenu');
                // console.log('$trigger', $trigger);
                // console.log('contextmenuEvent', contextmenuEvent);
                var sampleId = ($trigger)[0].getAttribute('sample');
                return {
                    // callback : function(key, options) {
                    // // default callback used when no callback specified for item
                    // console.log('default callback');
                    // var elem = this[0];
                    // console.log('key:', key);
                    // console.log('options:', options);
                    // console.log('elem', elem);
                    // console.log('eventId:', elem.getAttribute('eventId'));
                    // console.log('elemClass:', elem.getAttribute("class"));
                    // console.log('elemId:', elem.getAttribute("id"));
                    // console.log("href:", window.location.href);
                    // console.log("host:", window.location.host);
                    // console.log("pathname:", window.location.pathname);
                    // console.log("search:", window.location.search);
                    // },
                    items : {
                        "title" : {
                            name : sampleId,
                            icon : null,
                            disabled : (titleCallback == null),
                            callback : function(key, opt) {
                                if (titleCallback == null) {
                                    console.log('default titleCallback for column', sampleId);
                                } else {
                                    titleCallback(sampleId, config);
                                }
                            }
                        },
                        'reset' : createResetContextMenuItem(config)
                    }
                };
            }
        });
    };

    // typeLabel
    var setupTypeLabelContextMenu = function(config) {
        var titleCallback = config['datatypeTitleCallback'];

        $.contextMenu({
            // selector : ".axis",
            selector : ".typeLabel",
            trigger : 'left',
            callback : function(key, options) {
                // default callback
                var elem = this[0];
                console.log('elem', elem);
            },
            build : function($trigger, contextmenuEvent) {
                // var datatype = ($trigger[0].getAttribute('datatype'));
                var eventId = ($trigger[0].getAttribute('eventId'));
                var isPlus = utils.endsWith(eventId, "(+)");

                var fields = eventId.split("(");
                fields.pop();
                var sanitizedEventId = fields.join("(");
                var datatype = sanitizedEventId;

                var items = {
                    'title' : {
                        name : function() {
                            return datatype;
                        },
                        icon : null,
                        disabled : false,
                        callback : function(key, opt) {
                            if (titleCallback == null) {
                                console.log('datatype', datatype);
                                console.log('default titleCallback for datatype', datatype);
                            } else {
                                titleCallback(eventId, config);
                            }
                        }
                    },
                    "sep1" : "---------",
                    'toggle_datatype_visibility' : {
                        'name' : function() {
                            return 'toggle visibility';
                        },
                        'icon' : null,
                        'disabled' : null,
                        'callback' : function(key, opt) {
                            if ('hiddenDatatypes' in config['querySettings']) {
                            } else {
                                config['querySettings']['hiddenDatatypes'] = [];
                            }

                            var hiddenDatatypes = config['querySettings']['hiddenDatatypes'];
                            if (utils.isObjInArray(hiddenDatatypes, datatype)) {
                                utils.removeA(hiddenDatatypes, datatype);
                            } else {
                                hiddenDatatypes.push(datatype);
                            }

                            setCookieVal(config['querySettings']);

                            // trigger redrawing
                            var containerDivElem = document.getElementById(config['containerDivId']);
                            od.buildObservationDeck(containerDivElem, config);
                        }
                    },
                    "hide_null_samples_datatype" : {
                        name : "(un)hide null samples in this datatype",
                        icon : null,
                        disabled : false,
                        callback : function(key, opt) {
                            var querySettings = config['querySettings'];
                            if (!utils.hasOwnProperty(querySettings, "hide_null_samples_datatype")) {
                                querySettings['hide_null_samples_datatype'] = datatype;
                                delete querySettings["hide_null_samples_event"];
                            } else {
                                if (querySettings['hide_null_samples_datatype'] === datatype) {
                                    delete querySettings['hide_null_samples_datatype'];
                                } else {
                                    querySettings['hide_null_samples_datatype'] = datatype;
                                    delete querySettings["hide_null_samples_event"];
                                }
                            }

                            setCookieVal(querySettings);

                            var containerDivElem = document.getElementById(config['containerDivId']);
                            od.buildObservationDeck(containerDivElem, config);
                            return;
                        }
                    },
                    "test_fold" : {
                        "name" : "dev_features",
                        "disabled" : function() {
                            return (!getDevMode());
                        },
                        "items" : {
                            "hugoSearch" : {
                                "name" : "HUGO search",
                                "icon" : null,
                                "disabled" : false,
                                "callback" : function(key, opt) {
                                    var dialogElem = document.getElementById('hugoSearch');
                                    dialogElem.style["display"] = "block";

                                    $(dialogElem).dialog({
                                        'title' : 'HUGO search',
                                        "buttons" : {
                                            "close" : function() {
                                                $(this).dialog("close");
                                            }
                                        }
                                    });
                                }
                            },
                            "sigSearch" : {
                                "name" : "signature search",
                                "icon" : null,
                                "disabled" : false,
                                "callback" : function(key, opt) {
                                    var dialogElem = document.getElementById('sigSearch');
                                    dialogElem.style["display"] = "block";

                                    $(dialogElem).dialog({
                                        'title' : 'signature search',
                                        "buttons" : {
                                            "close" : function() {
                                                $(this).dialog("close");
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    },
                    "reset" : createResetContextMenuItem(config)
                };
                return {
                    'items' : items
                };
            }
        });
    };

    /**
     *context menu uses http://medialize.github.io/jQuery-contextMenu
     */
    var setupRowLabelContextMenu = function(config) {

        /**
         * This is a callback for medbook-workbench.
         */

        // example of titleCallback function
        // var titleCallback = function(eventId) {
        // var eventObj = config['eventAlbum'].getEvent(eventId);
        // var datatype = eventObj.metadata['datatype'];
        // if (datatype === 'expression data') {
        // // mRNA url: /wb/gene/<gene name>
        // var gene = eventId.replace('_mRNA', '');
        // var url = '/wb/gene/' + gene;
        // window.open(url, "_self");
        // } else if (datatype === 'clinical data') {
        // // clinical url: /wb/clinical/<name>
        // var feature = eventId;
        // var url = '/wb/clinical/' + feature;
        // window.open(url, "_self");
        // }
        // };

        var titleCallback = config['rowTitleCallback'];

        $.contextMenu({
            // selector : ".axis",
            selector : ".rowLabel",
            trigger : 'left',
            callback : function(key, options) {
                // default callback
                var elem = this[0];
                console.log('elem', elem);
            },
            build : function($trigger, contextmenuEvent) {
                // var eventId = ($trigger)[0].innerHTML.split('<')[0];
                var eventId = ($trigger)[0].getAttribute('eventId');
                var eventObj = config['eventAlbum'].getEvent(eventId);
                var datatype = eventObj.metadata['datatype'];
                var scoredDatatype = eventObj.metadata.scoredDatatype;
                var allowedValues = eventObj.metadata.allowedValues;

                var displayName = eventObj.metadata.displayName;

                var pivotable = (eventObj.metadata.weightedGeneVector.length);

                var pivotable_dataypes = ["clinical data", "expression data", 'expression signature', 'kinase target activity', "tf target activity", "mutation call"];

                var items = {
                    'title' : {
                        name : displayName,
                        icon : null,
                        disabled : function() {
                            var result = true;
                            var enableDatatypes = ["mutation impact score", "gistic_copy_number", "mutation call", 'expression data', 'clinical data', 'expression signature', 'kinase target activity', "tf target activity"];
                            if ((titleCallback != null) && (_.contains(enableDatatypes, datatype))) {
                                result = false;
                            }

                            return result;
                        },
                        callback : function(key, opt) {
                            if (titleCallback == null) {
                                console.log('default titleCallback for row', eventId);
                            } else {
                                titleCallback(eventId, config);
                            }
                        }
                    },
                    "sep1" : "---------",
                    'set_pivot' : {
                        'name' : function() {
                            return 'set as pivot';
                        },
                        'icon' : null,
                        'disabled' : function(key, opt) {
                            pivotable = false;
                            if (utils.isObjInArray(pivotable_dataypes, datatype)) {
                                pivotable = true;
                            }

                            if (pivotable) {
                                // if (true) {
                                return false;
                            } else {
                                return true;
                            }
                        },
                        'callback' : function(key, opt) {
                            // in workbench, selecting this should do the following:
                            // 1- set pivot cookie
                            // 2- meteor should pick up the cookie/session and retrieve the pivot data
                            // 3- meteor should force obs-deck to rebuild, setting pivot data

                            // meteor session
                            if ( typeof Session !== 'undefined') {
                                // if (false) {
                                var mName = eventId;
                                var mVersion = '';
                                // if (utils.isObjInArray(['expression signature', 'kinase target activity', "tf target activity"], datatype)) {
                                if (utils.isObjInArray(['expression signature', 'kinase target activity', "tf target activity"], datatype)) {
                                    var names = mName.split('_v');
                                    mVersion = names.pop();
                                    mName = names.join('_v');
                                    datatype = 'signature';
                                } else if (datatype === "expression data") {
                                    mName = eventObj.metadata.displayName;
                                    mVersion = 1;
                                    datatype = "expression";
                                } else if (datatype === "clinical data") {
                                    mName = eventId;
                                    mVersion = 1;
                                    datatype = "clinical";
                                } else if (datatype === "mutation call") {
                                    mName = eventObj.metadata.displayName;
                                    mVersion = 1;
                                    datatype = "mutation";
                                }

                                var pivotSessionSettings = {
                                    'name' : mName,
                                    'datatype' : datatype,
                                    'version' : mVersion
                                };

                                var querySettings = config['querySettings'];
                                querySettings['pivot_event'] = {
                                    'id' : eventId,
                                    'datatype' : datatype
                                };

                                var datatypes = [];
                                if ('pivot_sort_list' in querySettings) {
                                    datatypes = querySettings['pivot_sort_list'];
                                }
                                // TODO hard coded !!!
                                datatypes.push('expression data');
                                querySettings['pivot_sort_list'] = utils.eliminateDuplicates(datatypes);

                                setCookieVal(querySettings);

                                addSortStepToCookies(eventId, config, "colSort", true);

                                console.log('writing pivotSettings to Session', pivotSessionSettings);
                                setSession('pivotSettings', pivotSessionSettings);
                            } else {
                                console.log('no Session object. Writing pivotSettings to querySettings.');

                                var querySettings = config['querySettings'];
                                querySettings['pivot_event'] = {
                                    'id' : eventId,
                                    'datatype' : datatype
                                };
                                setCookieVal(querySettings);

                                addSortStepToCookies(eventId, config, "colSort", true);

                                // trigger redrawing
                                var containerDivElem = document.getElementById(config['containerDivId']);
                                od.buildObservationDeck(containerDivElem, config);
                            }
                        }
                    },
                    "sort" : {
                        name : "sort samples by this event",
                        icon : null,
                        disabled : false,
                        callback : function(key, opt) {
                            addSortStepToCookies(eventId, config, "colSort", false);

                            var containerDivElem = document.getElementById(config['containerDivId']);
                            od.buildObservationDeck(containerDivElem, config);
                        }
                    },
                    'hide_fold' : {
                        'name' : 'hide...',
                        'items' : {
                            "hide_null_samples_event" : {
                                name : "(un)hide null samples in this event",
                                icon : null,
                                disabled : false,
                                callback : function(key, opt) {
                                    var querySettings = config['querySettings'];

                                    if (!utils.hasOwnProperty(querySettings, "hide_null_samples_datatype")) {
                                        if (querySettings['hide_null_samples_datatype'] === datatype) {
                                            delete querySettings['hide_null_samples_datatype'];
                                        }
                                    }

                                    if (!utils.hasOwnProperty(querySettings, "hide_null_samples_event")) {
                                        querySettings["hide_null_samples_event"] = eventId;
                                        delete querySettings['hide_null_samples_datatype'];
                                    } else if (querySettings["hide_null_samples_event"] === eventId) {
                                        delete querySettings["hide_null_samples_event"];
                                    } else {
                                        querySettings["hide_null_samples_event"] = eventId;
                                        delete querySettings['hide_null_samples_datatype'];
                                    }

                                    setCookieVal(querySettings);

                                    var containerDivElem = document.getElementById(config['containerDivId']);
                                    od.buildObservationDeck(containerDivElem, config);
                                    return;
                                }
                            },
                            "hide_event" : {
                                name : "this event",
                                icon : null,
                                disabled : false,
                                callback : function(key, opt) {
                                    var querySettings = config['querySettings'];
                                    var hiddenEvents = querySettings['hiddenEvents'] || [];
                                    hiddenEvents.push(eventId);
                                    querySettings['hiddenEvents'] = utils.eliminateDuplicates(hiddenEvents);

                                    setCookieVal(querySettings);

                                    var containerDivElem = document.getElementById(config['containerDivId']);
                                    od.buildObservationDeck(containerDivElem, config);
                                }
                            }
                        }
                    },
                    "add_fold" : {
                        "name" : "add...",
                        "items" : {
                            "add_events_for_gene" : {
                                "name" : "events for gene",
                                "icon" : null,
                                "disabled" : function() {
                                    return (datatype === "clinical data");
                                },
                                "callback" : function(key, opt) {
                                    var gene = eventId.split(/_/)[0];
                                    var focusGenes = getSession("focusGenes") || [];
                                    focusGenes.push(gene);
                                    setSession("focusGenes", _.uniq(focusGenes));
                                    // TODO search for and add events related to this gene
                                    console.log("search for and add events related to these genes", getSession("focusGenes"));
                                }
                            },
                            "pathway_genes" : {
                                "name" : "expression of targets",
                                "icon" : null,
                                "disabled" : function() {
                                    var pathway_context_viewable = ["kinase target activity", "tf target activity"];
                                    var disabled = (_.contains(pathway_context_viewable, datatype)) ? false : true;
                                    return disabled;
                                },
                                "callback" : function(key, opt) {
                                    var sigName = eventId.replace(/_v\d+$/, "");
                                    console.log("add gene set for", sigName);
                                    // add gene set for signature
                                    var geneSetSelectElem = document.getElementById("geneset");
                                    if (_.isUndefined(geneSetSelectElem) || _.isNull(geneSetSelectElem)) {
                                        console.log("no geneSetSelectElem with ID", "geneset");
                                        return;
                                    }
                                    var geneSetOptions = geneSetSelectElem.getElementsByTagName("option");
                                    var foundMatch = false;
                                    _.each(geneSetOptions, function(option, index) {
                                        var text = option.innerHTML;
                                        text = text.replace(/ \(\d+\)$/, "").replace(/_targets_viper/, "_viper");
                                        // var val = option.getAttribute("value");
                                        // var geneList = val.split(/,/);
                                        if (text === sigName) {
                                            option.selected = true;
                                            $(geneSetSelectElem).trigger("change");
                                            foundMatch = true;
                                        }
                                    });
                                    if (!foundMatch) {
                                        alert("No gene set found for " + sigName + ".");
                                    }
                                }
                            }
                        }
                    },

                    "pathway_context" : {
                        "name" : "view pathway context",
                        "icon" : null,
                        "disabled" : function() {
                            var pathway_context_viewable = ["expression data", "mutation call", "kinase target activity", "tf target activity"];
                            var disabled = (_.contains(pathway_context_viewable, datatype)) ? false : true;
                            return disabled;
                        },
                        "callback" : function(key, opt) {
                            var geneSymbol = eventId.replace(/_mRNA$/, "").replace(/_mutation$/, "").replace(/_kinase_viper_v.+$/, "").replace(/_tf_viper_v.+$/, "");
                            var url = "/PatientCare/geneReport/" + geneSymbol;
                            console.log("linking out to", url, "for pathway context");
                            window.open(url, "_patientCare");
                        }
                    },

                    "test_fold" : {
                        "name" : "dev_features",
                        "disabled" : function() {
                            return (!getDevMode());
                        },
                        "items" : {
                            // TODO UI controls for dev features go here
                            // http://swisnl.github.io/jQuery-contextMenu/demo/input.html
                            "lock_item" : {
                                "name" : "lock item",
                                "type" : "checkbox",
                                "selected" : false,
                                "icon" : null,
                                "disabled" : false,
                                "callback" : function(key, opt) {
                                    console.log("event", eventId, datatype);
                                }
                            }
                        }
                    },
                    "sep2" : "---------",
                    "reset" : createResetContextMenuItem(config)
                };
                return {
                    'items' : items,
                    "events" : {
                        "show" : function(opt) {
                            // this is the trigger element
                            var $trigger = this;
                            // import states from data store

                            var sessionLockedEvents = getSession("lockedEvents") || {};

                            var eventId = eventObj.metadata.id;
                            var eventType = eventObj.metadata.datatype;

                            var isLocked = _.contains(sessionLockedEvents[eventType], eventId);
                            console.log("isLocked", isLocked);

                            // $.contextMenu.setInputValues(opt, $trigger.data());
                            // this basically fills the input commands from an object
                            // like {name: "foo", yesno: true, radio: "3", &hellip;}
                            $.contextMenu.setInputValues(opt, {
                                "lock_item" : isLocked
                            });
                        },
                        "hide" : function(opt) {
                            // this is the trigger element
                            var $trigger = this;
                            // export states to data store
                            $.contextMenu.getInputValues(opt, $trigger.data());
                            // this basically dumps the input commands' values to an object
                            // like {name: "foo", yesno: true, radio: "3", &hellip;}
                            var eventId = eventObj.metadata.id;
                            var eventType = eventObj.metadata.datatype;
                            var sessionLockedEvents = getSession("lockedEvents") || {};
                            if (_.isUndefined(sessionLockedEvents[eventType])) {
                                sessionLockedEvents[eventType] = [];
                            }
                            if ($trigger.data()["lock_item"]) {
                                // add event if true
                                sessionLockedEvents[eventType].push(eventId);
                                sessionLockedEvents[eventType] = _.uniq(sessionLockedEvents[eventType]);
                            } else {
                                // remove event if false
                                sessionLockedEvents[eventType] = _.without(sessionLockedEvents[eventType], eventId);
                            }
                            setSession("lockedEvents", sessionLockedEvents);
                        }
                    }
                };
            }
        });
    };

    /**
     * context menu uses http://medialize.github.io/jQuery-contextMenu
     */
    var setupExpressionCellContextMenu = function(config) {
        var sampleLinkoutCallback = config['columnTitleCallback'];

        $.contextMenu({
            // selector : ".axis",
            selector : ".mrna_exp",
            trigger : 'left',
            callback : function(key, options) {
                // default callback
                var elem = this[0];
            },
            build : function($trigger, contextmenuEvent) {
                var triggerElem = ($trigger)[0];
                var eventId = triggerElem.getAttribute('eventId');
                var sampleId = triggerElem.getAttribute('sampleId');
                var items = {
                    'title' : {
                        name : eventId + ' for ' + sampleId,
                        icon : null,
                        disabled : true
                    },
                    "sep1" : "---------",
                    "sample_link_out" : {
                        "name" : "go to details for " + sampleId,
                        "icon" : null,
                        "disabled" : false,
                        "callback" : function(key, opt) {
                            sampleLinkoutCallback(sampleId, config);
                        }
                    },
                    'rescaling_fold' : {
                        'name' : 'normalize coloring...',
                        'items' : {
                            "samplewise median rescaling" : {
                                name : "over each column",
                                icon : null,
                                disabled : false,
                                callback : function(key, opt) {
                                    // settings for rescaling
                                    var querySettings = config['querySettings'];
                                    querySettings['expression rescaling'] = {
                                        'method' : 'samplewiseMedianRescaling'
                                    };

                                    setCookieVal(querySettings);

                                    var containerDivElem = document.getElementById(config['containerDivId']);
                                    od.buildObservationDeck(containerDivElem, config);
                                }
                            },
                            "eventwise median rescaling" : {
                                name : "over each row",
                                icon : null,
                                disabled : false,
                                callback : function(key, opt) {
                                    // settings for rescaling
                                    var querySettings = config['querySettings'];
                                    querySettings['expression rescaling'] = {
                                        'method' : 'eventwiseMedianRescaling'
                                    };

                                    setCookieVal(querySettings);

                                    var containerDivElem = document.getElementById(config['containerDivId']);
                                    od.buildObservationDeck(containerDivElem, config);
                                }
                                // },
                                // "eventwise z-score rescaling" : {
                                // name : "by event z-score",
                                // icon : null,
                                // disabled : false,
                                // callback : function(key, opt) {
                                // // settings for rescaling
                                // var querySettings = config['querySettings'];
                                // querySettings['expression rescaling'] = {
                                // 'method' : 'zScoreExpressionRescaling'
                                // };
                                //
                                // setCookieVal(querySettings);
                                //
                                // var containerDivElem = document.getElementById(config['containerDivId']);
                                // od.buildObservationDeck(containerDivElem, config);
                                // }
                            }
                        }
                    },
                    "sep2" : "---------",
                    "reset" : createResetContextMenuItem(config)
                };
                return {
                    'items' : items
                };
            }
        });
    };

    /**
     * context menu uses http://medialize.github.io/jQuery-contextMenu
     */
    var setupCategoricCellContextMenu = function(config) {
        var sampleLinkoutCallback = config['columnTitleCallback'];

        $.contextMenu({
            // selector : ".axis",
            selector : ".categoric",
            trigger : 'left',
            callback : function(key, options) {
                // default callback
                var elem = this[0];
            },
            build : function($trigger, contextmenuEvent) {
                var triggerElem = ($trigger)[0];
                var eventId = triggerElem.getAttribute('eventId');
                var sampleId = triggerElem.getAttribute('sampleId');
                var items = {
                    'title' : {
                        name : eventId + ' for ' + sampleId,
                        icon : null,
                        disabled : true
                    },
                    "sep1" : "---------",
                    "sample_link_out" : {
                        "name" : "go to details for " + sampleId,
                        "icon" : null,
                        "disabled" : false,
                        "callback" : function(key, opt) {
                            sampleLinkoutCallback(sampleId, config);
                        }
                    },
                    "yulia expression rescaling" : {
                        name : "rescale mRNA values using this category",
                        icon : null,
                        disabled : false,
                        callback : function(key, opt) {
                            var cellElem = this[0];
                            var childrenElems = cellElem.children;
                            var eventId = cellElem.getAttribute('eventId');
                            var sampleId = cellElem.getAttribute('sampleId');
                            var val = cellElem.getAttribute('val');

                            console.log('key:', key, 'eventId:', eventId, 'val:', val);
                            console.log("href", window.location.href);
                            console.log("host", window.location.host);
                            console.log("pathname", window.location.pathname);
                            console.log("search", window.location.search);

                            // settings for rescaling
                            var querySettings = config['querySettings'];
                            querySettings['expression rescaling'] = {
                                'method' : 'yulia_rescaling',
                                'eventId' : eventId,
                                'val' : val
                            };

                            setCookieVal(querySettings);

                            var containerDivElem = document.getElementById(config['containerDivId']);
                            od.buildObservationDeck(containerDivElem, config);
                        }
                    },
                    "sep2" : "---------",
                    "reset" : createResetContextMenuItem(config)

                };
                return {
                    'items' : items
                };
            }
        });
    };

    /**
     * context menu uses http://medialize.github.io/jQuery-contextMenu
     */
    var setupSignatureCellContextMenu = function(config) {
        var sampleLinkoutCallback = config['columnTitleCallback'];

        $.contextMenu({
            // selector : ".axis",
            selector : ".signature",
            trigger : 'left',
            callback : function(key, options) {
                // default callback
                var elem = this[0];
            },
            build : function($trigger, contextmenuEvent) {
                var triggerElem = ($trigger)[0];
                var eventId = triggerElem.getAttribute('eventId');
                var sampleId = triggerElem.getAttribute('sampleId');
                var items = {
                    'title' : {
                        name : eventId + ' for ' + sampleId,
                        icon : null,
                        disabled : true
                    },
                    "sep1" : "---------",
                    "sample_link_out" : {
                        "name" : "go to details for " + sampleId,
                        "icon" : null,
                        "disabled" : false,
                        "callback" : function(key, opt) {
                            sampleLinkoutCallback(sampleId, config);
                        }
                    },
                    "sep2s" : "---------",
                    "reset" : createResetContextMenuItem(config)

                };
                return {
                    'items' : items
                };
            }
        });
    };

    /**
     * Draw the matrix in the containing div.
     * Requires:
     *      D3js
     *      OD_eventData.js
     * @param {Object} containingElem
     * @param {Object} config
     */
    var drawMatrix = function(containingDiv, config) {
        console.log("*** BEGIN DRAWMATRIX ***");

        var thisElement = utils.removeChildElems(containingDiv);

        // get eventList
        var eventAlbum = config['eventAlbum'];
        // eventAlbum.removeEmptyEvents(0.8);
        eventAlbum.fillInMissingSamples(null);

        eventAlbum.fillInDatatypeLabelEvents("black");

        var groupedEvents = eventAlbum.getEventIdsByType();
        var rowLabelColorMapper = d3.scale.category10();
        var eventList = [];
        for (var datatype in groupedEvents) {
            rowLabelColorMapper(datatype);
            var datatypeEventList = groupedEvents[datatype];
            // console.log('datatype', datatype, 'has', datatypeEventList.length, 'events', '<-- drawMatrix');
            eventList = eventList.concat(datatypeEventList);
        }

        var querySettings = config['querySettings'];

        var getRescalingData = function(OD_eventAlbum, querySettingsObj) {
            var groupedEvents = OD_eventAlbum.getEventIdsByType();
            var rescalingData = null;

            if (utils.hasOwnProperty(groupedEvents, 'expression data') && utils.hasOwnProperty(querySettingsObj, 'expression rescaling')) {
                var rescalingSettings = querySettingsObj['expression rescaling'];
                if (rescalingSettings['method'] === 'yulia_rescaling') {
                    rescalingData = OD_eventAlbum.yuliaExpressionRescaling(rescalingSettings['eventId'], rescalingSettings['val']);
                } else if (rescalingSettings['method'] === 'eventwiseMedianRescaling') {
                    // rescalingData = eventAlbum.zScoreExpressionRescaling();
                    rescalingData = OD_eventAlbum.eventwiseMedianRescaling(["expression data"]);
                } else if (rescalingSettings['method'] === 'zScoreExpressionRescaling') {
                    rescalingData = OD_eventAlbum.zScoreExpressionRescaling();
                } else if (rescalingSettings['method'] === 'samplewiseMedianRescaling') {
                    rescalingData = OD_eventAlbum.samplewiseMedianRescaling();
                } else {
                    // no rescaling
                }
            } else if (utils.hasOwnProperty(groupedEvents, 'expression data')) {
                rescalingData = OD_eventAlbum.eventwiseMedianRescaling(["expression data"]);
            } else {
                console.log('no expression data rescaling');
            }

            // rescalingData = eventAlbum.betweenMeansExpressionRescaling('Small Cell v Adeno', 'Adeno', 'Small Cell');
            return rescalingData;
        };

        var rescalingData = getRescalingData(eventAlbum, querySettings);

        var setColorMappers = function(rescalingData, eventAlbum) {

            /**
             * premap some colors
             */
            var premapColors = function(d3ScaleColormapper, colorSet) {
                var colorSets = {
                    "exclude" : {
                        "exclude" : "gray"
                    },
                    "small cell" : {
                        "exclude" : "gray",
                        "small cell" : "blue",
                        "not small cell" : "red"
                    },
                    "resistance" : {
                        "exclude" : "gray",
                        "naive" : "green",
                        "resistant" : "red"
                    },
                    "pos_neg" : {
                        "exclude" : "gray",
                        "pos" : "red",
                        "neg" : "blue"
                    },
                    "yes_no" : {
                        "exclude" : "gray",
                        "yes" : "green",
                        "no" : "red"
                    },
                    "adeno" : {
                        "exclude" : "gray",
                        "adeno" : "red",
                        "not adeno" : "blue"
                    },
                    //Response Evaluation Criteria in Solid Tumors (RECIST)
                    "recist" : {
                        // Complete Response
                        "cr" : "green",
                        // Partial Response
                        "pr" : "chartreuse",
                        // Stable Disease
                        "sd" : "orange",
                        // Progression of Disease
                        "pd" : "red"
                    }
                };

                // d3.scale.category10().range()
                var colorNames = {
                    "blue" : "#1f77b4",
                    "orange" : "#ff7f0e",
                    "green" : "#2ca02c",
                    "red" : "#d62728",
                    "purple" : "#9467bd",
                    "brown" : "#8c564b",
                    "pink" : "#e377c2",
                    "gray" : "#7f7f7f",
                    "chartreuse" : "#bcbd22",
                    "cyan" : "#17becf"
                };

                var mapping = (_.isUndefined(colorSets[colorSet])) ? {} : colorSets[colorSet];

                // map named colors to color code
                var inputMappings = {};
                if (!_.isUndefined(mapping)) {
                    _.each(mapping, function(value, key) {
                        var color = (_.isUndefined(colorNames[value])) ? value : colorNames[value];
                        inputMappings[key] = color;
                    });
                }

                //  assign pre-mapped colors
                var range = _.values(inputMappings);
                var domain = _.keys(inputMappings);

                // fill in remaining color range
                _.each(_.values(colorNames), function(color) {
                    if (!_.contains(range, color)) {
                        range.push(color);
                    }
                });

                // assign domain and range to color mapper
                d3ScaleColormapper.domain(domain);
                d3ScaleColormapper.range(range);

                // console.log("range", d3ScaleColormapper.range());
                // console.log("domain", d3ScaleColormapper.domain());
            };

            var expressionColorMapper = utils.centeredRgbaColorMapper(false);
            if (rescalingData != null) {
                var minExpVal = rescalingData['minVal'];
                var maxExpVal = rescalingData['maxVal'];
                expressionColorMapper = utils.centeredRgbaColorMapper(false, 0, minExpVal, maxExpVal);
            }

            var ordinalColorMappers = {};
            var ordinalTypes = utils.getKeys(eventAlbum.ordinalScoring);
            for (var i = 0, length = ordinalTypes.length; i < length; i++) {
                var allowedVals = ordinalTypes[i];
                var scoreVals = utils.getValues(eventAlbum.ordinalScoring[allowedVals]);
                var colorMapper = utils.centeredRgbaColorMapper(false, 0, jStat.min(scoreVals), jStat.max(scoreVals));
                ordinalColorMappers[allowedVals] = colorMapper;
            }

            // assign color mappers
            var colorMappers = {};
            for (var i = 0; i < eventList.length; i++) {
                var eventId = eventList[i];
                var allowedValues = eventAlbum.getEvent(eventId).metadata.allowedValues;
                if (allowedValues == 'categoric') {
                    var colorMapper = d3.scale.category10();
                    // TODO set a premapping color scheme dependent upon event
                    // colorSets ["exclude", "small cell", "resistance", "pos_neg", "yes_no", "adeno"]
                    var eventId_lc = eventId.toLowerCase();
                    var colorSet;
                    if (_.contains(["smallcell", "small_cell", "trichotomy"], eventId_lc)) {
                        colorSet = "small cell";
                    } else if (_.contains(["enzalutamide", "abiraterone", "docetaxel"], eventId_lc)) {
                        colorSet = "resistance";
                    } else if (_.contains(["mutations", "primary hr"], eventId_lc)) {
                        colorSet = "yes_no";
                    } else if (_.contains(["pten-ihc", "ar-fish"], eventId_lc)) {
                        colorSet = "pos_neg";
                    } else {
                        colorSet = "exclude";
                    }
                    premapColors(colorMapper, colorSet);
                    colorMappers[eventId] = colorMapper;
                } else if (allowedValues == 'numeric') {
                    // 0-centered color mapper
                    var eventObj = eventAlbum.getEvent(eventId);
                    var minAllowedVal = eventObj.metadata.minAllowedVal;
                    var maxAllowedVal = eventObj.metadata.maxAllowedVal;
                    if (( typeof minAllowedVal != "undefined") && ( typeof maxAllowedVal != "undefined")) {
                        // value range given in metadata
                        colorMappers[eventId] = utils.centeredRgbaColorMapper(false, 0, minAllowedVal, maxAllowedVal);
                    } else {
                        // value range computed from event data
                        var vals = eventAlbum.getEvent(eventId).data.getValues();
                        var numbers = [];
                        for (var j = 0; j < vals.length; j++) {
                            var val = vals[j];
                            if (utils.isNumerical(val)) {
                                numbers.push(val);
                            }
                        }
                        var minVal = Math.min.apply(null, numbers);
                        var maxVal = Math.max.apply(null, numbers);
                        colorMappers[eventId] = utils.centeredRgbaColorMapper(false, 0, minVal, maxVal);
                    }
                } else if (allowedValues == 'expression') {
                    // shared expression color mapper
                    colorMappers[eventId] = expressionColorMapper;
                } else if (allowedValues === "chasm") {
                    // -log p-val color mapping
                    colorMappers[eventId] = utils.centeredRgbaColorMapper(false, 0.5, 0, 1);
                } else if (eventAlbum.ordinalScoring.hasOwnProperty(allowedValues)) {
                    // ordinal data
                    colorMappers[eventId] = ordinalColorMappers[allowedValues];
                } else {
                    // default to categoric mapping
                    var colorMapper = d3.scale.category10();
                    colorMappers[eventId] = colorMapper;
                }
            }
            return colorMappers;
        };

        var colorMappers = setColorMappers(rescalingData, eventAlbum);

        var getColSortSteps = function(querySettings) {
            var colSortSteps = null;
            if ("colSort" in querySettings) {
                colSortSteps = new eventData.sortingSteps(querySettings["colSort"]["steps"]);
                for (var i = colSortSteps.getSteps().length - 1; i >= 0; i--) {
                    var step = colSortSteps.steps[i];
                    var name = step['name'];
                    if (eventAlbum.getEvent(name)) {
                        // event exists
                    } else {
                        // ignore events that are not found
                        console.log(name, 'not found, skip sorting by that event');
                        colSortSteps.removeStep(name);
                    }
                }
            }

            // column sort by pivot row -- old way
            if (utils.hasOwnProperty(querySettings, 'pivot_sort')) {
                var pivotSortSettings = querySettings['pivot_sort'];
                var pivotEvent = pivotSortSettings['pivot_event'];
                if (colSortSteps == null) {
                    colSortSteps = new eventData.sortingSteps();
                }
                if (eventAlbum.getEvent(pivotEvent)) {
                    // event exists
                    colSortSteps.addStep(pivotEvent, true);
                }
            }
            return colSortSteps;
        };

        var colSortSteps = getColSortSteps(querySettings);
        console.log("colSortSteps", colSortSteps);

        var getRowSortSteps = function(querySettings) {
            var rowSortSteps = null;
            if ('rowSort' in querySettings) {
                rowSortSteps = new eventData.sortingSteps(querySettings["rowSort"]["steps"]);
                for (var i = rowSortSteps.getSteps().length - 1; i >= 0; i--) {
                    var step = rowSortSteps.steps[i];
                    var name = step['name'];
                    if (eventAlbum.getEvent(name)) {
                        // event exists
                    } else {
                        // ignore events that are not found
                        console.log(name, 'not found, skip sorting by that event');
                        rowSortSteps.removeStep(name);
                    }
                }
            }
            return rowSortSteps;
        };

        var rowSortSteps = getRowSortSteps(querySettings);

        var getColNames = function(querySettings, eventAlbum, colSortSteps) {
            // get column names
            var colNames = null;

            colNames = eventAlbum.multisortSamples(colSortSteps);

            // find samples to hide
            var samplesToHide = [];
            if ('hide_null_samples_event' in querySettings) {
                var hide_null_samples_event = querySettings['hide_null_samples_event'];
                console.log("hide_null_samples_event", hide_null_samples_event);

                try {
                    var hideNullsEventObj = eventAlbum.getEvent(hide_null_samples_event);
                    var nullSamples = hideNullsEventObj.data.getNullSamples();
                    samplesToHide = samplesToHide.concat(nullSamples);
                } catch(error) {
                    console.log('ERROR while getting samples to hide in eventID:', hide_null_samples_event, 'error.message ->', error.message);
                } finally {
                    console.log('samplesToHide', samplesToHide);
                }
            } else if ("hide_null_samples_datatype" in querySettings) {
                var hide_null_samples_datatype = querySettings["hide_null_samples_datatype"];
                console.log("hide_null_samples_datatype", hide_null_samples_datatype);

                samplesToHide = eventAlbum.getDatatypeNullSamples(hide_null_samples_datatype);
            }

            // always hide clinical null samples
            var clinicalNullSamples = eventAlbum.getDatatypeNullSamples("clinical data");
            samplesToHide = samplesToHide.concat(clinicalNullSamples);

            samplesToHide = utils.eliminateDuplicates(samplesToHide);

            // colNames after hiding null samples
            var newColNames = [];
            for (var ci = 0; ci < colNames.length; ci++) {
                var colName = colNames[ci];
                if (utils.isObjInArray(config['displayedSamples'], colName)) {
                    // make sure displayedSamples are shown
                    newColNames.push(colName);
                } else if (utils.isObjInArray(samplesToHide, colName)) {
                    // samples have been specified for hiding
                    continue;
                } else if (config['displayedSamples'].length == 0) {
                    // no displayedSamples specified, so show them all by default
                    newColNames.push(colName);
                }
            }
            colNames = newColNames;
            // console.log('colNames:' + colNames);

            return colNames;
        };

        var colNames = getColNames(querySettings, eventAlbum, colSortSteps);

        // map colNames to numbers
        var colNameMapping = new Object();
        for (var i in colNames) {
            var name = colNames[i];
            colNameMapping[name] = i;
        }

        // get row names and map to numbers

        var getRowNames = function(querySettings, eventAlbum, colSortSteps, rowSortSteps) {

            var rowNames = eventAlbum.multisortEvents(rowSortSteps, colSortSteps);
            // console.log("rowNames", rowNames);

            // groupedPivotSorts ... uses pivot scoring on server side
            // TODO what about events that are in the album, but not in the pivot data?
            if (utils.hasOwnProperty(querySettings, 'pivot_sort_list')) {
                console.log('querySettings has a pivot_sort_list of datatypes', querySettings['pivot_sort_list']);
                rowNames = [];
                var pivotSortedRowNames = [];
                var pEventId = querySettings['pivot_event']['id'];
                var pEventObj = eventAlbum.getEvent(pEventId);
                var groupedPivotSorts = eventAlbum.getGroupedPivotSorts(pEventId);

                for (var datatype in groupedPivotSorts) {
                    // section header rows
                    var eventIds;
                    if (datatype === "datatype label") {
                        // skip the "datatype label" datatype
                        eventIds = [];
                    } else {
                        // events
                        eventIds = groupedPivotSorts[datatype];
                        // datatype label for correlated events
                        eventIds.unshift(datatype + "(+)");
                        // datatype label for anti-correlated events
                        eventIds.push(datatype + "(-)");
                    }
                    pivotSortedRowNames = pivotSortedRowNames.concat(eventIds);
                    // console.log(datatype, eventIds);
                }
                rowNames = pivotSortedRowNames.concat(rowNames);
                rowNames = utils.eliminateDuplicates(rowNames);
            }

            // console.log("rowNames", rowNames);

            // hide rows of datatype, preserving relative ordering
            var hiddenDatatypes = querySettings['hiddenDatatypes'] || [];
            var hiddenEvents = querySettings['hiddenEvents'] || [];
            var shownNames = [];

            var albumEventIds = eventAlbum.getAllEventIds();
            // console.log("albumEventIds", albumEventIds);

            for (var i = 0; i < rowNames.length; i++) {
                var rowName = rowNames[i];
                if (!utils.isObjInArray(albumEventIds, rowName)) {
                    // event doesn't exist ... skip
                    continue;
                }
                var datatype = eventAlbum.getEvent(rowName).metadata.datatype;
                if ((utils.isObjInArray(hiddenDatatypes, datatype)) || (utils.isObjInArray(hiddenEvents, rowName))) {
                    continue;
                }
                shownNames.push(rowName);
            }
            // console.log("shownNames", shownNames);
            rowNames = shownNames;

            // move pivot event to top of matrix (1st row)
            var pivotEventId = null;
            if (querySettings['pivot_event'] != null) {
                pivotEventId = querySettings['pivot_event']['id'];
                console.log('moving pivot event to top:', pivotEventId);
                rowNames.unshift(pivotEventId);
                rowNames = utils.eliminateDuplicates(rowNames);
            }

            // confirm events in rowNames exist in eventAlbum
            var confirmedEvents = [];
            for (var i = 0, length = rowNames.length; i < length; i++) {
                var eventId = rowNames[i];
                var eventObj = eventAlbum.getEvent(eventId);
                if (eventObj) {
                    // eventObj exists
                    confirmedEvents.push(eventId);
                } else {
                    console.log('eventObj not found for', eventId);
                }
            }
            rowNames = confirmedEvents;

            return rowNames;
        };

        var rowNames = getRowNames(querySettings, eventAlbum, colSortSteps, rowSortSteps);
        // console.log("rowNames", rowNames);

        // bring pivot event to top the top
        var pivotEventId = null;
        if (querySettings['pivot_event'] != null) {
            pivotEventId = querySettings['pivot_event']['id'];
            console.log('moving pivot event to top:', pivotEventId);
            rowNames.unshift(pivotEventId);
            rowNames = utils.eliminateDuplicates(rowNames);
        }

        /**
         * For each submatrix, find first index, last index, and row count.
         */
        var getBoundariesBetweenDatatypes = function() {
            var pivotEventObj = eventAlbum.getEvent(pivotEventId);
            if (_.isUndefined(pivotEventObj)) {
                return {};
            }
            var pivotEventDatatype = pivotEventObj.metadata.datatype;
            // pivot results for clinical data give top 5 only due to ANOVA score
            // var pageSize = (pivotEventDatatype === "clinical data") ? 5 : 10;
            var pageSize = 5;

            var rowNames_copy = rowNames.slice();
            rowNames_copy.reverse();
            var boundaries = {};
            _.each(rowNames_copy, function(rowName, index) {
                var eventObj = eventAlbum.getEvent(rowName);
                var datatype = eventObj.metadata.datatype;
                if (datatype === "datatype label" && datatype !== "mutation call") {
                    return;
                }
                if (_.isUndefined(boundaries[datatype])) {
                    boundaries[datatype] = {
                        "first" : index,
                        "last" : index
                    };
                } else {
                    if (boundaries[datatype]["last"] == index - 1) {
                        boundaries[datatype]["last"] = index;
                    }
                }
                boundaries[datatype]["count"] = boundaries[datatype]["last"] - boundaries[datatype]["first"] + 1;
            });

            // get non-correlator gene lists
            var sessionGeneList = getSession("geneList") || [];
            var cohort_tab_genelist_widget = getSession("cohort_tab_genelist_widget") || [];
            sessionGeneList = sessionGeneList.concat(cohort_tab_genelist_widget);

            // get +/- tags for row labels
            var rowNames_copy = rowNames.slice();
            rowNames_copy.reverse();
            var taggedEvents = {};
            var scoredEvents = _.pluck(eventAlbum.getPivotSortedEvents(pivotEventId), "key");
            _.each(_.keys(boundaries), function(datatype) {
                var skippedDatatypes = ["clinical data", "mutation call", "mutation impact score", "gistic_copy_number"];
                if (! _.contains(skippedDatatypes, datatype)) {
                    var data = boundaries[datatype];
                    var datatypeNames = [];
                    var suffix = eventAlbum.datatypeSuffixMapping[datatype];
                    for (var i = data["first"]; i < data["last"] + 1; i++) {
                        var rowName = rowNames_copy[i];
                        var geneName = rowName.replace(suffix, "");
                        if (! _.contains(sessionGeneList, geneName)) {
                            datatypeNames.push(rowName);
                        }
                    }
                    var corrEvents = datatypeNames.reverse();
                    _.each(corrEvents.slice(0, pageSize), function(posEvent) {
                        taggedEvents[posEvent] = "+";
                    });
                    // fix: wrong tagging when there are user-added events
                    if (pivotEventDatatype !== "clinical data") {
                        _.each(corrEvents.slice(pageSize), function(negEvent) {
                            if (_.contains(scoredEvents, negEvent.replace(suffix, ""))) {
                                taggedEvents[negEvent] = "-";
                            }
                        });
                    }
                }
            });

            return taggedEvents;
        };

        // TODO determine boundaries between pos/neg-correlated events
        if (!_.isNull(pivotEventId)) {
            var taggedEvents = getBoundariesBetweenDatatypes();
        }

        // assign row numbers to row names
        var rowNameMapping = new Object();
        for (var i in rowNames) {
            var name = rowNames[i];
            rowNameMapping[name] = i;
        }

        // setup margins

        var longestColumnName = utils.lengthOfLongestString(colNames);
        var longestRowName = utils.lengthOfLongestString(rowNames);

        console.log('longestRowName', longestRowName);

        var margin = {
            // "top" : ((longestColumnName > 3) ? (9 * longestColumnName) : 30),
            "top" : 10,
            "right" : 0,
            "bottom" : 0,
            "left" : ((longestRowName > 1) ? (8 * (longestRowName + 1)) : 15)
        };

        // document.documentElement.clientWidth
        var fullWidth = document.documentElement.clientWidth;
        var width = fullWidth - margin.left - margin.right;
        var denom = (colNames.length > rowNames.length) ? colNames.length : rowNames.length;
        var gridSize = Math.floor(width / denom);

        var minGridSize = 13;
        // gridSize = (gridSize > minGridSize) ? gridSize : minGridSize;
        // console.log('gridSize', gridSize, 'margin', (margin));

        if (gridSize <= minGridSize) {
            gridSize = minGridSize;
            fullWidth = (gridSize * denom) + margin.left + margin.right;
        }

        gridSize = minGridSize;
        console.log('gridSize', gridSize, 'margin', (margin));

        // document.documentElement.clientHeight
        var fullHeight = (margin.top + margin.bottom) + (gridSize * rowNames.length);
        var height = fullHeight - margin.top - margin.bottom;

        // SVG canvas
        var svg = d3.select(thisElement).append("svg").attr({
            // "width" : fullWidth + 0,
            "width" : fullWidth,
            "height" : fullHeight,
            // "viewBox" : "42 0 " + (fullWidth) + " " + (fullHeight),
            "viewBox" : "0 0 " + (fullWidth) + " " + (fullHeight),
            "perserveAspectRatio" : "xMinYMin meet"
        }).append("g").attr({
            "transform" : "translate(" + margin.left + "," + margin.top + ")"
        });

        var primerSvgRectElem = utils.createSvgRectElement(0, 0, 0, 0, fullWidth, fullHeight, {
            "fill" : "white",
            "class" : "primer"
        });

        // draw the matrix on a white background b/c color gradient varies alpha values
        svg.append('rect').attr({
            "x" : 0,
            "y" : 0,
            "rx" : 0,
            "ry" : 0,
            // "width" : width,
            // "height" : height,
            "width" : gridSize * colNames.length,
            "height" : gridSize * rowNames.length,
            "fill" : "white",
            "class" : "primer"
        });

        // row labels
        try {
            var sessionGeneLists = config["sessionGeneLists"] || {};
            var nonCorrGeneList = _.union.apply(this, (_.values(sessionGeneLists)));
            var nonUnderlineableDatatypes = ["datatype label"];

            var translateX = -6;
            var translateY = gridSize / 1.5;
            var rowLabels = svg.selectAll(".rowLabel").data(rowNames).enter().append("text").text(function(d) {
                var eventObj = eventAlbum.getEvent(d);
                var displayName = eventObj.metadata.displayName;
                var datatype = eventObj.metadata.datatype;
                if (datatype === "datatype label") {
                    displayName = displayName.toUpperCase();
                }

                // TODO hack to shorten signature names to remove type
                if (datatype === "mvl drug sensitivity") {
                    displayName = d.replace("_mvl_drug_sensitivity", "");
                } else if (datatype === "tf target activity") {
                    displayName = d.replace("_tf_viper", "");
                } else if (datatype === "kinase target activity") {
                    displayName = d.replace("_kinase_viper", "");
                }

                // remove version number
                displayName = displayName.replace(/_v\d+$/, "");

                if (!_.isUndefined(taggedEvents)) {
                    var tag = taggedEvents[d];
                    if (!_.isUndefined(tag)) {
                        displayName = displayName + " " + tag;
                    }
                }

                return displayName;
            }).attr({
                "x" : 0,
                "y" : function(d, i) {
                    return i * gridSize;
                },
                "transform" : "translate(" + translateX + ", " + translateY + ")",
                "class" : function(d, i) {
                    var eventObj = eventAlbum.getEvent(d);
                    var datatype = eventObj.metadata.datatype;
                    var s;
                    if (datatype === "datatype label") {
                        s = "typeLabel mono axis unselectable";
                    } else {
                        s = "rowLabel mono axis unselectable";
                        if (d === pivotEventId) {
                            s = s + " bold italic";
                            // s = s + " pivotEvent";
                        }
                    }

                    // underline genes added via geneset control
                    // underline to indicate user-selected events
                    if (pivotEventId != null) {
                        if (! _.contains(nonUnderlineableDatatypes, datatype)) {
                            var suffix = eventAlbum.datatypeSuffixMapping[datatype];
                            var regex = new RegExp(suffix + "$");
                            var geneName = d.replace(regex, "");
                            if (_.contains(nonCorrGeneList, geneName)) {
                                s = s + " underline";
                            } else {
                                var editedLabel = d.split("_",1)[0];
                                if (_.contains(nonCorrGeneList, editedLabel)) {
                                    s = s + " underline";
                                }
                            }
                        }
                    }

                    return s;
                },
                'eventId' : function(d, i) {
                    return d;
                },
                'datatype' : function(d, i) {
                    var eventObj = eventAlbum.getEvent(d);
                    var datatype = eventObj.metadata.datatype;
                    return datatype;
                }
            }).style("text-anchor", "end").style("fill", function(d) {
                var eventObj = eventAlbum.getEvent(d);
                var datatype = eventObj.metadata.datatype;
                if (datatype === "datatype label") {
                    return "black";
                } else {
                    return rowLabelColorMapper(datatype);
                }
            });
            // rowLabels.on("click", config["rowClickback"]);
            // rowLabels.on("contextmenu", config["rowRightClickback"]);

            // map event to pivot score
            var pivotScoresMap;
            if (pivotEventId != null) {
                pivotScoresMap = {};
                var pivotSortedEvents = eventAlbum.getPivotSortedEvents(pivotEventId);
                _.each(pivotSortedEvents, function(pivotObj) {
                    var key = pivotObj["key"];
                    var val = pivotObj["val"];
                    pivotScoresMap[key] = val;
                    // console.log(val, key, pivotEventId);
                });
            }

            rowLabels.append("title").text(function(d, i) {
                var eventObj = eventAlbum.getEvent(d);
                var datatype = eventObj.metadata.datatype;
                var allowedValues = eventObj.metadata.allowedValues;
                var s = 'event: ' + d + '\ndatatype: ' + datatype;

                if ((allowedValues === 'numeric') && (rescalingData != null) && (utils.hasOwnProperty(rescalingData, 'stats')) && ( typeof rescalingData['stats'][d] !== 'undefined')) {
                    s = s + '\nraw data stats: ' + utils.prettyJson(rescalingData['stats'][d]);
                }

                if ( typeof pivotScoresMap !== "undefined") {
                    var val = pivotScoresMap[d];
                    if ( typeof val === "undefined") {
                        // try _mRNA suffix
                        var key = d.replace(/_mRNA$/, "");
                        val = pivotScoresMap[key];
                    }

                    if ( typeof val !== "undefined") {
                        s = s + "\npivot score: " + val;
                    }
                }

                return s;
            });

        } catch(err) {
            console.log("ERROR drawing row labels:", err.name);
            console.log("--", err.message);
            resetObsDeck(config);
        } finally {
            console.log("finished drawing row labels");
        }

        // col labels
        try {
            var rotationDegrees = -90;
            translateX = Math.floor(gridSize / 5);
            translateY = -1 * Math.floor(gridSize / 3);
            var colLabels = svg.selectAll(".colLabel").data(colNames).enter().append("text").text(function(d) {
                return d;
            }).attr({
                "y" : function(d, i) {
                    return (i + 1) * gridSize;
                },
                "x" : 0,
                "transform" : "rotate(" + rotationDegrees + ") translate(" + translateX + ", " + translateY + ")",
                "class" : function(d, i) {
                    return "colLabel mono axis unselectable hidden";
                },
                "sample" : function(d, i) {
                    return d;
                }
            }).style("text-anchor", "start");
            // colLabels.on("click", config["columnClickback"]);
            // colLabels.on("contextmenu", config["columnRightClickback"]);
            colLabels.append("title").text(function(d) {
                var s = 'sample: ' + d;
                return s;
            });

        } catch(err) {
            console.log("ERROR drawing column labels:", err.name);
            console.log("--", err.message);
        } finally {
            console.log("finished drawing column labels");
        }

        // SVG elements for heatmap cells
        var dataList = eventAlbum.getAllDataAsList();
        var showDataList = [];
        for (var i = 0; i < dataList.length; i++) {
            var dataListObj = dataList[i];
            var eventId = dataListObj['eventId'];
            if (!utils.isObjInArray(rowNames, eventId)) {
                continue;
            } else {
                showDataList.push(dataListObj);
            }
        }

        /**
         * Create an SVG group element icon to put in the matrix cell.
         * @param {Object} x
         * @param {Object} y
         * @param {Object} rx
         * @param {Object} ry
         * @param {Object} width
         * @param {Object} height
         * @param {Object} attributes
         */
        var createMutTypeSvg = function(x, y, rx, ry, width, height, attributes) {
            var iconGroup = document.createElementNS(utils.svgNamespaceUri, "g");
            utils.setElemAttributes(iconGroup, {
                "class" : "mutTypeIconGroup"
            });

            var types = attributes["val"];
            // types.push("complex");

            // background of cell
            attributes["fill"] = "lightgrey";
            iconGroup.appendChild(utils.createSvgRectElement(x, y, rx, ry, width, height, attributes));
            delete attributes["stroke-width"];

            if ((utils.isObjInArray(types, "sg")) || (utils.isObjInArray(types, "ins")) || (utils.isObjInArray(types, "complex"))) {
                attributes["fill"] = "red";
                var topHalfIcon = utils.createSvgRectElement(x, y, rx, ry, width, height / 2, attributes);
                iconGroup.appendChild(topHalfIcon);
            }
            if ((utils.isObjInArray(types, "ss")) || (utils.isObjInArray(types, "del")) || (utils.isObjInArray(types, "complex"))) {
                attributes["fill"] = "blue";
                var bottomHalfIcon = utils.createSvgRectElement(x, y + height / 2, rx, ry, width, height / 2, attributes);
                iconGroup.appendChild(bottomHalfIcon);
            }
            if ((utils.isObjInArray(types, "ms")) || (utils.isObjInArray(types, "snp")) || (utils.isObjInArray(types, "complex"))) {
                attributes["fill"] = "green";
                var centeredCircleIcon = utils.createSvgCircleElement(x + width / 2, y + height / 2, height / 4, attributes);
                iconGroup.appendChild(centeredCircleIcon);
            }
            return iconGroup;
        };

        try {
            var heatMap = svg.selectAll(".cell").data(showDataList).enter().append(function(d, i) {
                var getUpArrowPointsList = function(x, y, width, height) {
                    var pointsList = [];
                    pointsList.push(((width / 2) + x) + "," + (0 + y));
                    pointsList.push((width + x) + "," + (height + y));
                    pointsList.push((0 + x) + "," + (height + y));
                    return pointsList;
                };

                var getDownArrowPointsList = function(x, y, width, height) {
                    var pointsList = [];
                    pointsList.push(((width / 2) + x) + "," + (height + y));
                    pointsList.push((width + x) + "," + (0 + y));
                    pointsList.push((0 + x) + "," + (0 + y));
                    return pointsList;
                };

                var group = document.createElementNS(utils.svgNamespaceUri, "g");
                group.setAttributeNS(null, "class", "cell unselectable");

                var colName = d['id'];
                if (! utils.hasOwnProperty(colNameMapping, colName)) {
                    return group;
                }

                var strokeWidth = 2;
                var x = (colNameMapping[d['id']] * gridSize);
                var y = (rowNameMapping[d['eventId']] * gridSize);
                var rx = 0;
                var ry = rx;
                var width = gridSize - (0.5 * strokeWidth);
                var height = width;

                var type = d['eventId'];
                var val = d['val'];
                var colorMapper = colorMappers[d['eventId']];

                var getFill = function(d) {
                    var allowed_values = eventAlbum.getEvent(d['eventId']).metadata.allowedValues;
                    var val = d["val"];
                    if (_.isString(val)) {
                        val = val.toLowerCase();
                    }
                    // if (eventAlbum.ordinalScoring.hasOwnProperty(allowed_values)) {
                    // var score = eventAlbum.ordinalScoring[allowed_values][val];
                    // return colorMapper(score);
                    // } else {
                    // return colorMapper(val);
                    // }
                    return colorMapper(val);
                };

                // pivot background
                var pivotEventObj;
                var pivotEventColorMapper;
                var strokeOpacity = 1;
                if (pivotEventId != null) {
                    pivotEventObj = eventAlbum.getEvent(pivotEventId);
                    pivotEventColorMapper = colorMappers[pivotEventId];
                    strokeOpacity = 0.4;
                }

                var getStroke = function(d) {
                    var grey = "#E6E6E6";
                    var stroke;
                    if (_.isUndefined(pivotEventColorMapper) || d["eventId"] === pivotEventId) {
                        stroke = grey;
                    } else {
                        // use fill for sample pivot event value
                        var sampleId = d["id"];
                        var data = pivotEventObj.data.getData([sampleId]);
                        var val = data[0]["val"];
                        if (val === null) {
                            stroke = grey;
                        } else {
                            // !!! colors are mapped to lowercase of strings !!!
                            if (_.isString(val)) {
                                val = val.toLowerCase();
                            }
                            stroke = pivotEventColorMapper(val);
                        }
                    }
                    return stroke;
                };

                if ((type === null) || (d['val'] === null)) {
                    // final rectangle for null values
                    var attributes = {
                        "fill" : "lightgrey",
                        "stroke" : getStroke(d),
                        "stroke-width" : strokeWidth,
                        "stroke-opacity" : strokeOpacity
                    };
                    group.appendChild(utils.createSvgRectElement(x, y, rx, ry, width, height, attributes));
                    return group;
                } else {
                    // draw over the primer rectangle instead of drawing a background for each cell
                    // background for icons
                    // attributes["fill"] = "white";
                    // attributes["fill"] = rowLabelColorMapper(eventAlbum.getEvent(d['eventId']).metadata.datatype)
                }
                // group.appendChild(utils.createSvgRectElement(x, y, rx, ry, width, height, attributes));

                var attributes = {
                    "stroke" : getStroke(d),
                    "stroke-width" : strokeWidth,
                    "fill" : getFill(d),
                    "stroke-opacity" : strokeOpacity
                };
                var icon;
                if (eventAlbum.getEvent(d['eventId']).metadata.allowedValues === 'categoric') {
                    attributes['class'] = 'categoric';
                    attributes['eventId'] = d['eventId'];
                    attributes['sampleId'] = d['id'];
                    attributes['val'] = d['val'];
                    icon = utils.createSvgRectElement(x, y, rx, ry, width, height, attributes);
                } else if (eventAlbum.getEvent(d['eventId']).metadata.datatype === 'expression data') {
                    attributes['class'] = 'mrna_exp';
                    attributes['eventId'] = d['eventId'];
                    attributes['sampleId'] = d['id'];
                    attributes['val'] = d['val'];
                    icon = utils.createSvgRectElement(x, y, rx, ry, width, height, attributes);
                } else if (utils.isObjInArray(["expression signature", "kinase target activity", "tf target activity", "mvl drug sensitivity"], eventAlbum.getEvent(d['eventId']).metadata.datatype)) {
                    attributes['class'] = "signature";
                    attributes['eventId'] = d['eventId'];
                    attributes['sampleId'] = d['id'];
                    attributes['val'] = d['val'];
                    icon = utils.createSvgRectElement(x, y, rx, ry, width, height, attributes);
                } else if (eventAlbum.getEvent(d['eventId']).metadata.datatype === 'mutation call') {
                    // oncoprint-style icons
                    attributes['class'] = "signature";
                    attributes['eventId'] = d['eventId'];
                    attributes['sampleId'] = d['id'];
                    // val is a list of mutation types
                    attributes['val'] = d['val'].sort();

                    icon = createMutTypeSvg(x, y, rx, ry, width, height, attributes);
                } else if (eventAlbum.getEvent(d['eventId']).metadata.datatype !== "datatype label") {
                    // for generalized numeric datatype
                    attributes['class'] = eventAlbum.getEvent(d['eventId']).metadata.datatype;
                    attributes['eventId'] = d['eventId'];
                    attributes['sampleId'] = d['id'];
                    attributes['val'] = d['val'];
                    icon = utils.createSvgRectElement(x, y, rx, ry, width, height, attributes);
                } else if (eventAlbum.getEvent(d['eventId']).metadata.datatype === "datatype label") {
                    var eventId = d["eventId"];
                    var datatype;
                    var headOrTail;
                    if (utils.endsWith(eventId, "(+)")) {
                        datatype = eventId.replace("(+)", "");
                        headOrTail = "head";
                    } else {
                        datatype = eventId.replace("(-)", "");
                        headOrTail = "tail";
                    }

                    // https://en.wikipedia.org/wiki/List_of_Unicode_characters
                    // http://www.fileformat.info/info/unicode/char/search.htm
                    // http://shapecatcher.com/
                    // http://www.charbase.com/block/miscellaneous-symbols-and-pictographs
                    // https://stackoverflow.com/questions/12036038/is-there-unicode-glyph-symbol-to-represent-search?lq=1
                    // use "C/C++/Java source code" from search results: http://www.fileformat.info/info/unicode/char/search.htm
                    var glyphs = {
                        "upArrow" : "\u2191",
                        "downArrow" : "\u2193",
                        "upArrowBar" : "\u2912",
                        "downArrowBar" : "\u2913",
                        "magGlass" : "\uD83D\uDD0E",
                        "ghost" : "\uD83D\uDC7B"
                    };

                    attributes['class'] = "datatype";
                    attributes['eventId'] = datatype;
                    attributes["fill"] = rowLabelColorMapper(datatype);
                    var colNameIndex = colNameMapping[colName];

                    // if (querySettings['pivot_event'] == null) {
                    // attributes["stroke-width"] = "0px";
                    // attributes["fill"] = rowLabelColorMapper(datatype);
                    // icon = utils.createSvgRectElement(x, (1 + y + (height / 2)), 0, 0, width, 2, attributes);
                    // } else

                    if (colNameIndex == 0) {
                        // up
                        icon = document.createElementNS(utils.svgNamespaceUri, "g");
                        attributes["stroke-width"] = "0px";
                        group.onclick = function() {
                            var upOrDown = (headOrTail === "head") ? "down" : "up";
                            setDatatypePaging(datatype, headOrTail, upOrDown);
                        };
                        attributes["points"] = getUpArrowPointsList(x, y, width, height).join(" ");
                        var polygon = utils.createSvgRectElement(x, y, 0, 0, width, height, attributes);

                        var labelAttributes = {
                            "font-size" : 16,
                            "fill" : "lightgray",
                            // "x" : x + 1.3,
                            "text-anchor" : "middle",
                            "x" : x + (gridSize / 2),
                            "y" : y + 10
                        };

                        var label = document.createElementNS(utils.svgNamespaceUri, "text");
                        utils.setElemAttributes(label, labelAttributes);

                        var textNode = document.createTextNode(glyphs.upArrow);
                        label.appendChild(textNode);

                        icon.appendChild(polygon);
                        icon.appendChild(label);
                    } else if (colNameIndex == 1) {
                        // down
                        icon = document.createElementNS(utils.svgNamespaceUri, "g");
                        attributes["stroke-width"] = "0px";
                        group.onclick = function() {
                            var upOrDown = (headOrTail === "head") ? "up" : "down";
                            setDatatypePaging(datatype, headOrTail, upOrDown);
                        };
                        attributes["points"] = getDownArrowPointsList(x, y, width, height).join(" ");
                        var polygon = utils.createSvgRectElement(x, y, 0, 0, width, height, attributes);

                        var labelAttributes = {
                            "font-size" : 16,
                            "fill" : "lightgray",
                            "text-anchor" : "middle",
                            "x" : x + (gridSize / 2),
                            "y" : y + 10
                        };

                        var label = document.createElementNS(utils.svgNamespaceUri, "text");
                        utils.setElemAttributes(label, labelAttributes);

                        var textNode = document.createTextNode(glyphs.downArrow);
                        label.appendChild(textNode);

                        icon.appendChild(polygon);
                        icon.appendChild(label);
                    } else if (colNameIndex == 2) {
                        // top or bottom
                        icon = document.createElementNS(utils.svgNamespaceUri, "g");
                        attributes["stroke-width"] = "0px";
                        group.onclick = function() {
                            setDatatypePaging(datatype, headOrTail, "0");
                        };
                        var polygon = utils.createSvgRectElement(x, y, 0, 0, width, height, attributes);
                        var textNode;
                        if (headOrTail === "head") {
                            textNode = document.createTextNode(glyphs.upArrowBar);
                        } else {
                            textNode = document.createTextNode(glyphs.downArrowBar);
                        }

                        var labelAttributes = {
                            "font-size" : 16,
                            "fill" : "lightgray",
                            "text-anchor" : "middle",
                            "x" : x + (gridSize / 2),
                            "y" : y + 12.5
                        };

                        var label = document.createElementNS(utils.svgNamespaceUri, "text");
                        utils.setElemAttributes(label, labelAttributes);
                        label.appendChild(textNode);
                        icon.appendChild(polygon);
                        icon.appendChild(label);
                    } else {
                        // section lines
                        attributes["stroke-width"] = "0px";
                        attributes["fill"] = rowLabelColorMapper(datatype);
                        icon = utils.createSvgRectElement(x, (1 + y + (height / 2)), 0, 0, width, 2, attributes);
                    }
                }
                group.appendChild(icon);

                return group;
            });

            // heatmap click event
            // heatMap.on("click", config["cellClickback"]).on("contextmenu", config["cellRightClickback"]);

            // heatmap titles
            heatMap.append("title").text(function(d) {
                var eventId = d["eventId"];
                var datatype = eventAlbum.getEvent(eventId).metadata.datatype;
                var sampleId = d['id'];
                var val = d["val"];
                if (datatype === "datatype label") {
                    var colNameIndex = colNameMapping[sampleId];
                    var headOrTail;
                    if (utils.endsWith(eventId, "(+)")) {
                        datatype = eventId.replace("(+)", "");
                        headOrTail = "head";
                    } else {
                        datatype = eventId.replace("(-)", "");
                        headOrTail = "tail";
                    }
                    var anti = (headOrTail === "head") ? "" : "ANTI-";
                    var s = "";
                    if (colNameIndex == 0) {
                        var moreOrLess;
                        if (headOrTail === "head") {
                            moreOrLess = "MORE";
                        } else {
                            moreOrLess = "LESS";
                        }
                        s = "show " + datatype + " events " + moreOrLess + " " + anti + "CORRELATED to pivot event";
                    } else if (colNameIndex == 1) {
                        var moreOrLess;
                        if (headOrTail === "head") {
                            moreOrLess = "LESS";
                        } else {
                            moreOrLess = "MORE";
                        }
                        s = "show " + datatype + " events " + moreOrLess + " " + anti + "CORRELATED to pivot event";
                    } else if (colNameIndex == 2) {
                        s = "show TOP " + datatype + " events " + anti + "CORRELATED to pivot event";
                    } else {

                    }
                    return s;
                } else {
                    // var s = "r:" + d['eventId'] + "\n\nc:" + d['id'] + "\n\nval:" + d['val'] + "\n\nval_orig:" + d['val_orig'];
                    var eventId = d["eventId"];
                    var id = d["id"];
                    var val = d["val"];
                    if (datatype === "mutation call" && !_.isNull(val)) {
                        _.each(val, function(code, index) {
                            if (code === "ms") {
                                val[index] = "missense";
                            } else if (code === "sg") {
                                val[index] = "stop gained";
                            } else if (code === "ss") {
                                val[index] = "ss";
                            }
                        });
                    }
                    var s = "event: " + eventId + "\nsample: " + id + "\nvalue: " + val;
                    return s;
                }
            });

        } catch(err) {
            console.log("ERROR drawing matrix cells:", err.name);
            console.log("--", err.message);
        } finally {
            console.log("finished drawing matrix cells");
        }

        console.log("*** END DRAWMATRIX ***");
        return config;
        // end drawMatrix
    };

})(observation_deck);
