/* Validações puras, compartilhadas pelo formulário e pelos testes. */
(function(root){
  const digits=value=>value.replace(/\D/g,'');
  function validCPF(value){
    const cpf=digits(value);
    if(cpf.length!==11 || /^(\d)\1{10}$/.test(cpf))return false;
    return [9,10].every(length=>{
      const sum=cpf.slice(0,length).split('').reduce((total,n,i)=>total+Number(n)*(length+1-i),0);
      const digit=(sum*10)%11;
      return (digit===10?0:digit)===Number(cpf[length]);
    });
  }
  function validate(name,value,data){
    if(!value.trim())return 'Preencha este campo para continuar.';
    switch(name){
      case 'name': return value.trim().split(/\s+/).length<2?'Informe seu nome e sobrenome.':'';
      case 'email': return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)?'Informe um e-mail válido, como voce@exemplo.com.':'';
      case 'cpf': return !validCPF(value)?'Informe um CPF válido com 11 dígitos.':'';
      case 'cep': return digits(value).length!==8?'Informe um CEP com 8 dígitos.':'';
      case 'password': return value.length<8 || !/[a-zA-Z]/.test(value) || !/\d/.test(value)?'Use ao menos 8 caracteres, uma letra e um número.':'';
      case 'confirm': return value!==data.password?'As senhas não coincidem. Confira e tente novamente.':'';
      default:return '';
    }
  }
  const api={digits,validCPF,validate};
  if(typeof module!=='undefined')module.exports=api;else root.TaskFlowValidation=api;
})(typeof window!=='undefined'?window:globalThis);
