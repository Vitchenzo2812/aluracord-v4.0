import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React from 'react';
import appConfig from '../config.json';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { ButtonSendSticker } from '../src/components/ButtonSendSticker';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzM5Mjk3MSwiZXhwIjoxOTU4OTY4OTcxfQ.2vM2AO7TD49M1j8cjxmyxsPpyyzZCCwosHhb_DdyhEU';
const SUPABASE_URL = 'https://vgskgwykyetidfbzoeln.supabase.co'
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function listenMessagesInRealTime(addMessage) {
    return supabaseClient
      .from('Messages')
      .on('INSERT', (respostaLive) => {
        addMessage(respostaLive.new);
      })
      .subscribe();
  }

export default function ChatPage() {
    // Sua lógica vai aqui
    const router = useRouter();
    const userLog = router.query.username;
    const [message, setMessage] = React.useState('');
    const [list, setList] = React.useState([]);
    //console.log('roteamento.query', router.query);
    //console.log('usuarioLogado', userLog);
    // ./Sua lógica vai aqui

    React.useEffect(() => {
        supabaseClient
            .from('Messages')
            .select('*')
            .order('id', { ascending: false })
            .then(({ data }) => {
                //console.log('Dados da Consulta: ', data);
                setList(data);
    });
        //Quero reusar um valor de referencia (objeto/array)
        //Passar uma função pro setState
        const subscription = listenMessagesInRealTime((newMessage) => {
            console.log('Nova mensagem: ', newMessage);
               setList((valueCurrentOfTheList) => {
                console.log('Valor atual da lista: ', valueCurrentOfTheList);
                   return [
                    newMessage,
                    ...valueCurrentOfTheList,
                 ]
               });
        });
        return () => {
            subscription.unsubscribe(); 
        }
}, []);

    function handleNewMessage(newMessage) {
    const message = {
        from: userLog,
        text: newMessage,
    }

    supabaseClient
        .from('Messages')
        .insert([
            //Tem que ser um objeto com os MESMOS CAMPOS que você escreveu no supabase
            message
        ])
        .then(({ data }) => {
            console.log('Criando Mensagem: ', data);  
        });
        setMessage('');
   }
        
    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: appConfig.theme.colors.primary[300],
                backgroundImage: `url(https://p4.wallpaperbetter.com/wallpaper/210/156/866/winter-snow-tree-nature-wallpaper-preview.jpg)`,
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.neutrals[700],
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        backgroundColor: appConfig.theme.colors.neutrals[600],
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >
                    {<MessageList messages={list} />}
                    {/*list.map((currentMessage) => {
                        return (
                            <li key={currentMessage.id}>
                                {currentMessage.from}: {currentMessage.text}
                            </li>
                        );
                        })*/} 

                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            value={message}
                            onChange={function (event) {
                                const valueMessage = event.target.value
                                setMessage(valueMessage);
                            }}
                            onKeyPress={function (event) {
                                if(event.key === 'Enter'){
                                    event.preventDefault();
                                    handleNewMessage(message);
                                }
                            }}
                            placeholder="Insira sua mensagem aqui..."
                            type="textarea"
                            styleSheet={{
                                width: '100%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.neutrals[800],
                                marginRight: '12px',
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                        />
                        {/* CallBack */}
                        <ButtonSendSticker 
                            onStickerClick={(sticker) => {
                                //console.log('[USANDO O COMPONENTE] Salva esse sticker no banco', sticker);
                                handleNewMessage(`:sticker: ${sticker}`)
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function Header() {
    return (
        <>
            <Box styleSheet={{ 
                width: '100%', 
                marginBottom: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
                }} >

                <Text variant='heading5'>
                    Chat
                </Text>
                
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    label='Logout'
                    href="/"
                />
            </Box>
        </>
    )
}

function MessageList(props) {
    //console.log(props);
    return (
        <Box
            tag="ul"
            styleSheet={{
                overflow: 'scroll',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >
            {props.messages.map((mensagem) => {
                return (
                    <Text
                    key={mensagem.id}
                    tag="li"
                    styleSheet={{
                        borderRadius: '5px',
                        padding: '6px',
                        marginBottom: '12px',
                        hover: {
                            backgroundColor: appConfig.theme.colors.neutrals[700],
                        }
                    }}
                >
                    <Box
                        styleSheet={{
                            marginBottom: '8px',
                        }}
                    >
                        <Image
                            styleSheet={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                display: 'inline-block',
                                marginRight: '8px',
                            }}
                            src={`https://github.com/${mensagem.from}.png`}
                        />
                        <Text tag="strong">
                            {mensagem.from}
                        </Text>
                        <Text
                            styleSheet={{
                                fontSize: '10px',
                                marginLeft: '8px',
                                color: appConfig.theme.colors.neutrals[300],
                            }}
                            tag="span"
                        >
                            {(new Date().toLocaleDateString())}
                        </Text>
                    </Box>
                    {/* Declarativo */}
                    {mensagem.text.startsWith(':sticker:') ? (
                            <Image src={mensagem.text.replace(':sticker:', '')} />
                        ): (
                            mensagem.text 
                    )}
                </Text>
                );
            })}
        </Box>
    )
}