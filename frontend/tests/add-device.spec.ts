import { test, expect } from "@playwright/test"
import { MakeUser, Delete, signUp} from "./auths"

test("test if device can be add via bluetooth", async({page}) => {
    //make a fake bluetooth connection
    await page.addInitScript( () => {
        const IS_PAIRED_UUID = "55A7DC43-48C1-4AD8-BC31-F3D6F08A58A02"
        const SERIAL_NUMBER_UUID = "55A7DC43-48C1-4AD8-BC31-F3D6F08A58A01"

        Object.defineProperty(navigator, "bluetooth",{
            configurable: true,
            value: {
                requestDevice: async () => {
                    gatt: {
                        connect: async () => ({
                            getPrimaryService: async () => {
                                getCharacteristic: async (uuid: string) => {
                                    if(uuid === IS_PAIRED_UUID){
                                        return {
                                            readValue: async () =>
                                                new DataView(Uint8Array.from([0]).buffer),
                                            writeValue: async () => {},
                                        }
                                    }

                                    if(uuid === SERIAL_NUMBER_UUID) {
                                        const bytes = new TextEncoder().encode("SNSA-TEST-001")
                                        return {
                                            readValue: async () => new DataView(bytes.buffer),
                                            writeValue: async () => {},
                                        }
                                    }

                                    throw new Error(`Unkown characteristic: ${uuid}`)
                                }
                            }
                        })
                    }
                        
                }
            }
        })
    })
    
    
    
    //real test begin
    await page.goto("/")
    const user = MakeUser();

    await signUp(page, user);



    await Delete(page, user)
})