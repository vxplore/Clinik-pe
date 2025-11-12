import { Button, Divider, List, Textarea, TextInput } from "@mantine/core";
import { IconPlus, IconPrinter, IconSearch, IconX } from "@tabler/icons-react";
import { Autocomplete } from '@mantine/core';
import { Avatar } from '@mantine/core';



export default function EprescriptionPage() {
    return (
        <>
            <div className="grid md:grid-cols-3 grid-cols-1 gap-4 mb-6 h-[calc(100vh_-_190px)] overflow-auto">
                <div className="col-span-2 flex flex-col gap-4">
                    <div className="bg-white p-4 rounded-lg border border-[#EDEBEB]">
                        <div className="text-black text-sm font-medium mb-1">Search Patient</div>
                        <div className="flex gap-2">
                            <Autocomplete
                                size="md"
                                placeholder="Search by name, mobile, patient ID"
                                leftSection={<IconSearch size={16} />}
                                className="w-full"
                                data={['React', 'Angular', 'Vue', 'Svelte']}
                            />
                            <div>
                                <Button size="md" className="!bg-[#E2EBFF] !text-[#2563EB] !p-3">
                                    <IconPlus size={20} />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-[#EDEBEB] flex flex-col gap-3">
                        <div>
                            <div className="text-black text-sm font-medium mb-1">Chief Complaints / Symptoms</div>
                            <TextInput
                                size="md"
                                placeholder="e.g., Fever, Headache for 3 days"
                                className="w-full"
                            />
                        </div>
                        <div>
                            <div className="text-black text-sm font-medium mb-1">Diagnosis / Condition</div>
                            <TextInput
                                size="md"
                                placeholder="e.g., Viral Fever"
                                className="w-full"
                            />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-[#EDEBEB] flex flex-col gap-3">
                        <div className="mb-1 flex justify-between items-center">
                            <div className="font-medium text-lg text-black">Medicines</div>
                            <Button size="md" leftSection={<IconPlus size={14} />} className="!bg-[#E2EBFF] !text-[#2563EB] !p-3 !font-normal">Add Medicine</Button>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="rounded-lg p-4 flex items-center justify-between bg-[#F9F9F9] border border-[#EEEEEE]">
                                <div>
                                    <div className="text-black font-sm font-medium">Paracetamol</div>
                                    <small className="block text-[#787777]">500mg, Tablet, 3 days</small>
                                    <small className="block text-[#787777]">1-0-1 (OD) - Before meals</small>
                                </div>
                                <div>
                                    <IconX className="cursor-pointer" size={18} />
                                </div>
                            </div>
                            <div className="rounded-lg p-4 flex items-center justify-between bg-[#F9F9F9] border border-[#EEEEEE]">
                                <div>
                                    <div className="text-black font-sm font-medium">Azithromycin</div>
                                    <small className="block text-[#787777]">250mg, Capsule, 5 days</small>
                                    <small className="block text-[#787777]">0-1-0 (HS) - After meals</small>
                                </div>
                                <div>
                                    <IconX className="cursor-pointer" size={18} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-[#EDEBEB] flex flex-col">
                        <div className="flex items-center justify-between">
                            <div className="text-black font-sm font-medium">Investigation / Lab</div>
                            <div>
                                <Button size="md" leftSection={<IconPlus size={14} />} className="!bg-[#E2EBFF] !text-[#2563EB] !p-3 !font-normal">Add</Button>
                            </div>
                        </div>
                        <Divider my="md" />
                        <div className="flex items-center justify-between">
                            <div className="text-black font-sm font-medium">Additional Info</div>
                            <div>
                                <Button size="md" leftSection={<IconPlus size={14} />} className="!bg-[#E2EBFF] !text-[#2563EB] !p-3 !font-normal">Add</Button>
                            </div>
                        </div>
                        <Divider my="md" />
                        <div>
                            <div className="text-black text-sm font-medium mb-1">Advice / Notes</div>
                            <Textarea
                                minRows={4}
                                autosize
                                className="w-full"
                                placeholder="e.g., Drink plenty of fluids, Take complete rest..."
                            />
                        </div>
                    </div>

                </div>
                <div className="bg-white px-3 py-4 rounded-lg border border-[#EDEBEB]">
                    <div className="flex items-center justify-between">
                        <div className="font-medium text-lg text-black">Live Preview</div>
                        <div>
                            <IconPrinter className="cursor-pointer" size={18} />
                        </div>
                    </div>
                    <Divider my="md" />
                    <div className="flex items-center gap-4">
                        <Avatar src="/images/Ellipse.webp" size={60} alt="it's me" />
                        <div>
                            <div className="text-black font-sm font-medium">Johnathan Doe</div>
                            <small className="block text-[#787777]">Male, 34 years</small>
                            <small className="block text-[#787777]">PID: PT-00123</small>
                        </div>
                    </div>
                    <Divider my="md" />
                    <div>
                        <div className="text-black font-sm font-medium">Diagnosis</div>
                        <small className="block text-[#787777]">Viral Fever</small>
                    </div>
                    <Divider my="md" />
                    <div>
                        <div className="text-black font-sm font-medium">Medicines</div>
                        <List className="list-disc">
                            <List.Item><small className="block text-[#787777] ">Paracetamol 500mg: 1-0-1, Before meals, 3 days</small></List.Item>
                            <List.Item><small className="block text-[#787777] ">Azithromycin 250mg: 0-1-0, After meals, 5 days</small></List.Item>
                        </List>
                    </div>
                    <Divider my="md" />
                    <div>
                        <div className="text-black font-sm font-medium">Advice</div>
                        <small className="block text-[#787777]">Drink plenty of fluids. Take complete rest for 3 days.</small>
                    </div>
                </div>
            </div>
            <div className="flex justify-end items-center gap-3 bg-white p-3 rounded-lg border border-[#EDEBEB]">
                <div className="flex items-center gap-1">
                    <i>
                        <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_278_9157)">
                                <path d="M0 2.1875C0 1.46289 0.587891 0.875 1.3125 0.875H3.9375C4.66211 0.875 5.25 1.46289 5.25 2.1875V4.8125C5.25 5.53711 4.66211 6.125 3.9375 6.125H1.3125C0.587891 6.125 0 5.53711 0 4.8125V2.1875ZM1.75 2.625V4.375H3.5V2.625H1.75ZM0 9.1875C0 8.46289 0.587891 7.875 1.3125 7.875H3.9375C4.66211 7.875 5.25 8.46289 5.25 9.1875V11.8125C5.25 12.5371 4.66211 13.125 3.9375 13.125H1.3125C0.587891 13.125 0 12.5371 0 11.8125V9.1875ZM1.75 9.625V11.375H3.5V9.625H1.75ZM8.3125 0.875H10.9375C11.6621 0.875 12.25 1.46289 12.25 2.1875V4.8125C12.25 5.53711 11.6621 6.125 10.9375 6.125H8.3125C7.58789 6.125 7 5.53711 7 4.8125V2.1875C7 1.46289 7.58789 0.875 8.3125 0.875ZM10.5 2.625H8.75V4.375H10.5V2.625ZM7 8.3125C7 8.07188 7.19688 7.875 7.4375 7.875H9.1875C9.42813 7.875 9.625 8.07188 9.625 8.3125C9.625 8.55312 9.82187 8.75 10.0625 8.75H10.9375C11.1781 8.75 11.375 8.55312 11.375 8.3125C11.375 8.07188 11.5719 7.875 11.8125 7.875C12.0531 7.875 12.25 8.07188 12.25 8.3125V10.9375C12.25 11.1781 12.0531 11.375 11.8125 11.375H10.0625C9.82187 11.375 9.625 11.1781 9.625 10.9375C9.625 10.6969 9.42813 10.5 9.1875 10.5C8.94687 10.5 8.75 10.6969 8.75 10.9375V12.6875C8.75 12.9281 8.55313 13.125 8.3125 13.125H7.4375C7.19688 13.125 7 12.9281 7 12.6875V8.3125ZM10.0625 13.125C9.94647 13.125 9.83519 13.0789 9.75314 12.9969C9.67109 12.9148 9.625 12.8035 9.625 12.6875C9.625 12.5715 9.67109 12.4602 9.75314 12.3781C9.83519 12.2961 9.94647 12.25 10.0625 12.25C10.1785 12.25 10.2898 12.2961 10.3719 12.3781C10.4539 12.4602 10.5 12.5715 10.5 12.6875C10.5 12.8035 10.4539 12.9148 10.3719 12.9969C10.2898 13.0789 10.1785 13.125 10.0625 13.125ZM11.8125 13.125C11.6965 13.125 11.5852 13.0789 11.5031 12.9969C11.4211 12.9148 11.375 12.8035 11.375 12.6875C11.375 12.5715 11.4211 12.4602 11.5031 12.3781C11.5852 12.2961 11.6965 12.25 11.8125 12.25C11.9285 12.25 12.0398 12.2961 12.1219 12.3781C12.2039 12.4602 12.25 12.5715 12.25 12.6875C12.25 12.8035 12.2039 12.9148 12.1219 12.9969C12.0398 13.0789 11.9285 13.125 11.8125 13.125Z" fill="#4B5563" />
                            </g>
                            <defs>
                                <clipPath id="clip0_278_9157">
                                    <path d="M0 0H12.25V14H0V0Z" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                    </i>
                    <i>
                        <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_278_9160)">
                                <path d="M5.25 3.5C5.25 3.01602 5.64102 2.625 6.125 2.625C6.60898 2.625 7 3.01602 7 3.5V3.71328C7 4.4707 6.93437 5.22539 6.80586 5.96914L4.49805 6.66094C3.38789 6.99453 2.62773 8.01719 2.62773 9.17656V11.1426C2.62773 12.2363 3.51641 13.125 4.61016 13.125C5.32109 13.125 5.97734 12.7449 6.33008 12.127L6.71016 11.4625C7.44297 10.1773 7.98164 8.79102 8.30703 7.34727L10.8883 6.57344L10.5465 7.59883C10.4563 7.8668 10.5027 8.15938 10.6668 8.38633C10.8309 8.61328 11.0961 8.75 11.3777 8.75H14.875C15.359 8.75 15.75 8.35898 15.75 7.875C15.75 7.39102 15.359 7 14.875 7H12.5891L13.0813 5.52617C13.1852 5.21719 13.1059 4.87539 12.8789 4.64023C12.652 4.40508 12.3129 4.31758 11.9984 4.41055L8.65156 5.4168C8.71719 4.85078 8.75 4.28477 8.75 3.71328V3.5C8.75 2.05078 7.57422 0.875 6.125 0.875C4.67578 0.875 3.5 2.05078 3.5 3.5V4.375C3.5 4.85898 3.89102 5.25 4.375 5.25C4.85898 5.25 5.25 4.85898 5.25 4.375V3.5ZM4.99844 8.33984L6.33828 7.93789C6.05391 8.86211 5.66836 9.75352 5.18711 10.5957L4.80703 11.2602C4.76602 11.3312 4.68945 11.3777 4.60469 11.3777C4.47617 11.3777 4.37227 11.2738 4.37227 11.1453V9.17656C4.37227 8.79102 4.62656 8.44922 4.9957 8.33711L4.99844 8.33984ZM0.65625 10.0625C0.292578 10.0625 0 10.3551 0 10.7188C0 11.0824 0.292578 11.375 0.65625 11.375H1.7582C1.75273 11.2984 1.75 11.2219 1.75 11.1426V10.0625H0.65625ZM16.8438 11.375C17.2074 11.375 17.5 11.0824 17.5 10.7188C17.5 10.3551 17.2074 10.0625 16.8438 10.0625H8.36445C8.18125 10.5082 7.97617 10.9457 7.75469 11.375H16.8438Z" fill="#4B5563" />
                            </g>
                            <defs>
                                <clipPath id="clip0_278_9160">
                                    <path d="M0 0H17.5V14H0V0Z" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                    </i>
                    <span>Dr. Ananya Patel</span>
                </div>
                <div>
                    <Button variant="default" className="font-normal" size="md">
                        Save Draft
                    </Button>
                </div>
                <div>
                    <Button className="!bg-[#0D52AF] !text-white font-normal" size="md">
                        Generate Prescription
                    </Button>
                </div>
            </div>
        </>
    );
}