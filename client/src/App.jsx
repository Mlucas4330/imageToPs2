import {
    Button,
    Center,
    Container,
    Grid,
    GridItem,
    Heading,
    Image,
    Input,
    Text,
    VisuallyHidden,
    useToast,
    InputGroup,
    InputRightElement,
    IconButton,
    ButtonGroup
} from '@chakra-ui/react'
import { AttachmentIcon, CopyIcon, DownloadIcon } from '@chakra-ui/icons'
import { useRef, useState } from 'react'
import { v4 } from 'uuid'
import { StorageError, deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '../firebase.js'
import qrcode from './assets/download.png'
import copy from 'copy-to-clipboard'

const App = () => {
    const [inputImage, setInputImage] = useState(null)
    const [outputImage, setOutputImage] = useState(null)
    const [inputImageFormatted, setInputImageFormatted] = useState(null)
    const [loading, setLoading] = useState(false)
    const [loadingDownload, setLoadingDownload] = useState(false)
    const toast = useToast()
    const [href, setHref] = useState()
    const downloadRef = useRef(null)

    const baseURL = import.meta.env.VITE_NODE_ENV === 'development' ? import.meta.env.VITE_API_URL : 'api/'

    const handleInputImage = e => {
        const image = e.target.files[0]

        setInputImage(image)
        setInputImageFormatted(URL.createObjectURL(image))
    }

    const handleApply = async () => {
        if (!inputImage) {
            return toast({
                status: 'error',
                description: 'Insira uma imagem',
                duration: 3000,
                isClosable: true
            })
        }

        try {
            setLoading(true)

            const imageRef = ref(storage, `${v4()}-${inputImage.name}`)

            // Salvar arquivo na firebase
            await uploadBytes(imageRef, inputImage)

            const response = await fetch(baseURL + '/apply-filter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    imageURL: await getDownloadURL(imageRef)
                })
            })

            const { code, data, message } = await response.json()

            if (code !== 200) {
                return toast({
                    status: 'error',
                    description: message,
                    duration: 3000,
                    isClosable: true
                })
            }

            toast({
                status: 'success',
                description: message,
                duration: 3000,
                isClosable: true
            })

            setOutputImage(data.outputImage)

            await deleteObject(imageRef)
        } catch (err) {
            console.error(err)

            if (err instanceof StorageError) {
                return toast({
                    status: 'error',
                    description: 'Erro ao fazer upload do arquivo',
                    duration: 3000,
                    isClosable: true
                })
            }
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async () => {
        if (!outputImage) {
            return toast({
                status: 'error',
                description: 'Erro ao baixar imagem',
                duration: 3000,
                isClosable: true
            })
        }

        try {
            setLoadingDownload(true)

            const response = await fetch(outputImage)

            const blob = await response.blob()

            const url = URL.createObjectURL(blob)

            downloadRef.current.download = inputImage.name

            setHref(url)
        } catch (err) {
            console.log(err)
        } finally {
            setLoadingDownload(false)
        }
    }

    const handleCopy = async () => {
        const isCopied = copy('29dd6597-1bb1-4b02-af44-f538378cbeaa')

        if (isCopied) {
            toast({
                description: 'Copiado para a área de transferência',
                status: 'success',
                duration: 2000,
                isClosable: true
            })
        }
    }

    return (
        <Container maxW={'container.lg'}>
            <Center mt={5}>
                <Text textAlign={'center'} as={'b'} size={'xs'}>
                    Obs: A IA precisa identificar um rosto na imagem para aplicar o filtro.
                </Text>
            </Center>
            <Grid
                templateColumns={{
                    sm: '1fr',
                    md: '1fr 1fr'
                }}
                p={5}
            >
                <GridItem>
                    <Center flexDirection={'column'} gap={5}>
                        <Button rightIcon={<AttachmentIcon />} cursor={'pointer'} as={'label'} htmlFor='input'>
                            Inserir imagem
                        </Button>
                        <VisuallyHidden>
                            <Input onChange={handleInputImage} name='input' id='input' type='file' accept='image/*' />
                        </VisuallyHidden>
                        <Center>
                            <Image minH={300} minW={300} maxH={400} maxW={400} src={inputImageFormatted} />
                        </Center>
                        <Button isLoading={loading} lo colorScheme='blue' onClick={handleApply}>
                            Aplicar filtro
                        </Button>
                    </Center>
                </GridItem>
                <GridItem>
                    <Center flexDirection={'column'} gap={5}>
                        <Heading tex>Imagem com filtro</Heading>
                        <Image minH={300} minW={300} maxH={400} maxW={400} src={outputImage} />
                        <Button
                            isLoading={loadingDownload}
                            ref={downloadRef}
                            as={'a'}
                            href={href}
                            target='_blank'
                            download
                            cursor={'pointer'}
                            onClick={handleDownload}
                            colorScheme='green'
                            rightIcon={<DownloadIcon />}
                        >
                            Baixar Imagem
                        </Button>
                    </Center>
                </GridItem>
            </Grid>
            <Grid
                p={5}
                templateColumns={{
                    sm: '1fr',
                    md: '1fr 1fr'
                }}
            >
                <GridItem>
                    <Text fontSize={'2xl'}>
                        Cada imagem custa alguns centavos para ser gerada, porém não estou cobrando nada pelo site. Sinta-se livre para doar
                        qualquer valor afim de manter o site vivo!
                    </Text>
                    <ButtonGroup mt={3}>
                        <Button
                            colorScheme={'linkedin'}
                            as={'a'}
                            target={'_blank'}
                            href={'https://www.linkedin.com/in/lucas-medeiros-2b77591ab/'}
                        >
                            Linkedin
                        </Button>
                        <Button
                            as={'a'}
                            target={'_blank'}
                            href={'https://api.whatsapp.com/send?phone=5551989431913'}
                            colorScheme={'whatsapp'}
                        >
                            Whatsapp
                        </Button>

                        <Button as={'a'} target={'_blank'} href={'https://www.github.com/Mlucas4330'} colorScheme={'gray'}>
                            Github
                        </Button>
                    </ButtonGroup>
                </GridItem>

                <GridItem justifyItems={'center'}>
                    <Center>
                        <Image src={qrcode} />
                    </Center>

                    <InputGroup mt={3} size={'lg'}>
                        <Input readOnly placeholder={'29dd6597-1bb1-4b02-af44-f538378cbeaa'} />
                        <InputRightElement>
                            <IconButton onClick={handleCopy} icon={<CopyIcon />} />
                        </InputRightElement>
                    </InputGroup>
                </GridItem>
            </Grid>
        </Container>
    )
}

export default App

