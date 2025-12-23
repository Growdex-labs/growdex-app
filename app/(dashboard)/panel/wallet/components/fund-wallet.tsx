import { DepositIcon } from "@/components/svg"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Landmark } from "lucide-react"

export default function FundWallet() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <button className="w-full sm:w-[90%] bg-khaki-200 hover:bg-khaki-300 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <DepositIcon />
                    Fund Wallet
                </button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                <SheetTitle>Fund wallet</SheetTitle>
                <SheetDescription>
                    Easily manage and store your funds in one secure place.
                </SheetDescription>
                </SheetHeader>
                <div className="grid flex-1 auto-rows-min gap-6 px-4">
                    <div className="grid gap-3">
                        <label htmlFor="sheet-fund-amount" className='text-gray-500'>Amount</label>
                        <input type="number" id="sheet-fund-amount" className='border border-gray-300 rounded-lg p-2' placeholder='50000'/>
                    </div>
                    {/* no payment method added */}
                    <div className="grid gap-3">
                        <label htmlFor="sheet-card-details" className='text-gray-500'>Card Details</label>
                        <input type="text" id="sheet-card-details" className='border border-gray-300 rounded-lg p-2' placeholder='Card name'/>
                        <div className="grid grid-cols-5 gap-1">
                            <input type="number" placeholder="Card number" className='border border-gray-300 rounded-lg p-2 lg:col-span-3'/>
                            <input type="number" placeholder="02/45" className='border border-gray-300 rounded-lg p-2'/>
                            <input type="number" placeholder="CVV" className='border border-gray-300 rounded-lg p-2'/>
                        </div>
                    </div>
                    {/* if payment method added*/}
                    <div className="grid grid-cols-3 gap-3">
                        {/* card */}
                        <div className="col-span-2 bg-dimYellow rounded-lg p-2">
                            {/* Mastercard Logo & number */}
                            <div className="flex justify-between">
                                <div className="flex flex-col items-center">
                                    <div className="flex gap-[-8px]">
                                        <div className="w-5 h-5 rounded-full bg-red-500 opacity-80"></div>
                                        <div className="w-5 h-5 rounded-full bg-orange-300 opacity-80 -ml-2"></div>
                                    </div>
                                    <small className="text-black text-[8px]">mastercard</small>
                                </div>
                                <div>
                                    <small>**** **** **** 7223</small>
                                </div>
                            </div>
                        </div>

                        {/* switch card btn */}
                        <button className="text-peru-200 px-1 py-2 rounded-lg bg-gray-300">Switch card</button>
                    </div>

                    {/* other payment options */}
                    <div className="grid gap-3">
                        {/* radio group */}
                        <div className="flex items-center gap-2">
                            <input type="radio" name="payment" id="payment" className="w-4 h-4"/>
                            <label htmlFor="payment" className="inline-flex gap-1 items-center">
                                <Landmark className="w-4 h-4" />
                                Pay with bank transfer
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="radio" name="payment" id="payment" className="w-4 h-4"/>
                            <label htmlFor="payment" className="inline-flex gap-1 items-center">
                                <img src="/logos_paypal.png" alt="paypal" />
                                Pay with Paypal
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="radio" name="payment" id="payment" className="w-4 h-4"/>
                            <label htmlFor="payment" className="inline-flex gap-1 items-center">
                                <img src="/simple-icons_zelle.png" alt="zelle" />
                                Pay with Zelle
                            </label>
                        </div>
                    </div>
                </div>
                <SheetFooter>
                <button className="bg-khaki-200 hover:bg-khaki-300 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <DepositIcon />
                    Fund Wallet
                </button>
                <button>Save card</button>
                <SheetClose asChild className='md:hidden'>
                    <button>Close</button>
                </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
