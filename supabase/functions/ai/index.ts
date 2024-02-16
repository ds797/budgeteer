import { cors } from '../_shared/cors.ts'
import { user } from '../_shared/user.ts'
import { openai, json } from '../_shared/openai.ts'
import { respond, err } from '../_shared/response.ts'

const instruct_category = `You're given a Group and a Category (the category is part of the Group). From the following list of Personal Finance Categories (PFCs), select which PFC(s) fit the Category best. Return the PFCs in JSON format, with two keys: 'pfc' and 'confidence', both arrays. Each entry in 'pfc' should have an entry in 'confidence', a float from 0-1.
INCOME_DIVIDENDS
INCOME_INTEREST_EARNED
INCOME_RETIREMENT_PENSION
INCOME_TAX_REFUND
INCOME_UNEMPLOYMENT
INCOME_WAGES
INCOME_OTHER_INCOME
TRANSFER_IN_CASH_ADVANCES_AND_LOANS
TRANSFER_IN_DEPOSIT
TRANSFER_IN_INVESTMENT_AND_RETIREMENT_FUNDS
TRANSFER_IN_SAVINGS
TRANSFER_IN_ACCOUNT_TRANSFER
TRANSFER_IN_OTHER_TRANSFER_IN
TRANSFER_OUT_INVESTMENT_AND_RETIREMENT_FUNDS
TRANSFER_OUT_SAVINGS
TRANSFER_OUT_WITHDRAWAL
TRANSFER_OUT_ACCOUNT_TRANSFER
TRANSFER_OUT_OTHER_TRANSFER_OUT
LOAN_PAYMENTS_CAR_PAYMENT
LOAN_PAYMENTS_CREDIT_CARD_PAYMENT
LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT
LOAN_PAYMENTS_MORTGAGE_PAYMENT
LOAN_PAYMENTS_STUDENT_LOAN_PAYMENT
LOAN_PAYMENTS_OTHER_PAYMENT
BANK_FEES_ATM_FEES
BANK_FEES_FOREIGN_TRANSACTION_FEES
BANK_FEES_INSUFFICIENT_FUNDS
BANK_FEES_INTEREST_CHARGE
BANK_FEES_OVERDRAFT_FEES
BANK_FEES_OTHER_BANK_FEES
ENTERTAINMENT_CASINOS_AND_GAMBLING
ENTERTAINMENT_MUSIC_AND_AUDIO
ENTERTAINMENT_SPORTING_EVENTS_AMUSEMENT_PARKS_AND_MUSEUMS
ENTERTAINMENT_TV_AND_MOVIES
ENTERTAINMENT_VIDEO_GAMES
ENTERTAINMENT_OTHER_ENTERTAINMENT
FOOD_AND_DRINK_BEER_WINE_AND_LIQUOR
FOOD_AND_DRINK_COFFEE
FOOD_AND_DRINK_FAST_FOOD
FOOD_AND_DRINK_GROCERIES
FOOD_AND_DRINK_RESTAURANT
FOOD_AND_DRINK_VENDING_MACHINES
FOOD_AND_DRINK_OTHER_FOOD_AND_DRINK
GENERAL_MERCHANDISE_BOOKSTORES_AND_NEWSSTANDS
GENERAL_MERCHANDISE_CLOTHING_AND_ACCESSORIES
GENERAL_MERCHANDISE_CONVENIENCE_STORES
GENERAL_MERCHANDISE_DEPARTMENT_STORES
GENERAL_MERCHANDISE_DISCOUNT_STORES
GENERAL_MERCHANDISE_ELECTRONICS
GENERAL_MERCHANDISE_GIFTS_AND_NOVELTIES
GENERAL_MERCHANDISE_OFFICE_SUPPLIES
GENERAL_MERCHANDISE_ONLINE_MARKETPLACES
GENERAL_MERCHANDISE_PET_SUPPLIES
GENERAL_MERCHANDISE_SPORTING_GOODS
GENERAL_MERCHANDISE_SUPERSTORES
GENERAL_MERCHANDISE_TOBACCO_AND_VAPE
GENERAL_MERCHANDISE_OTHER_GENERAL_MERCHANDISE
HOME_IMPROVEMENT_FURNITURE
HOME_IMPROVEMENT_HARDWARE
HOME_IMPROVEMENT_REPAIR_AND_MAINTENANCE
HOME_IMPROVEMENT_SECURITY
HOME_IMPROVEMENT_OTHER_HOME_IMPROVEMENT
MEDICAL_DENTAL_CARE
MEDICAL_EYE_CARE
MEDICAL_NURSING_CARE
MEDICAL_PHARMACIES_AND_SUPPLEMENTS
MEDICAL_PRIMARY_CARE
MEDICAL_VETERINARY_SERVICES
MEDICAL_OTHER_MEDICAL
PERSONAL_CARE_GYMS_AND_FITNESS_CENTERS
PERSONAL_CARE_HAIR_AND_BEAUTY
PERSONAL_CARE_LAUNDRY_AND_DRY_CLEANING
PERSONAL_CARE_OTHER_PERSONAL_CARE
GENERAL_SERVICES_ACCOUNTING_AND_FINANCIAL_PLANNING
GENERAL_SERVICES_AUTOMOTIVE
GENERAL_SERVICES_CHILDCARE
GENERAL_SERVICES_CONSULTING_AND_LEGAL
GENERAL_SERVICES_EDUCATION
GENERAL_SERVICES_INSURANCE
GENERAL_SERVICES_POSTAGE_AND_SHIPPING
GENERAL_SERVICES_STORAGE
GENERAL_SERVICES_OTHER_GENERAL_SERVICES
GOVERNMENT_AND_NON_PROFIT_DONATIONS
GOVERNMENT_AND_NON_PROFIT_GOVERNMENT_DEPARTMENTS_AND_AGENCIES
GOVERNMENT_AND_NON_PROFIT_TAX_PAYMENT
GOVERNMENT_AND_NON_PROFIT_OTHER_GOVERNMENT_AND_NON_PROFIT
TRANSPORTATION_BIKES_AND_SCOOTERS
TRANSPORTATION_GAS
TRANSPORTATION_PARKING
TRANSPORTATION_PUBLIC_TRANSIT
TRANSPORTATION_TAXIS_AND_RIDE_SHARES
TRANSPORTATION_TOLLS
TRANSPORTATION_OTHER_TRANSPORTATION
TRAVEL_FLIGHTS
TRAVEL_LODGING
TRAVEL_RENTAL_CARS
TRAVEL_OTHER_TRAVEL
RENT_AND_UTILITIES_GAS_AND_ELECTRICITY
RENT_AND_UTILITIES_INTERNET_AND_CABLE
RENT_AND_UTILITIES_RENT
RENT_AND_UTILITIES_SEWAGE_AND_WASTE_MANAGEMENT
RENT_AND_UTILITIES_TELEPHONE
RENT_AND_UTILITIES_WATER
RENT_AND_UTILITIES_OTHER_UTILITIES`

const instruct_transaction = `You're given a Name for a transaction. There is a list of Personal Finance Categories (PFCs) below. Return your response in JSON format with one key: 'pfc', which contains the string of the PFC that matches best.
INCOME_DIVIDENDS
INCOME_INTEREST_EARNED
INCOME_RETIREMENT_PENSION
INCOME_TAX_REFUND
INCOME_UNEMPLOYMENT
INCOME_WAGES
INCOME_OTHER_INCOME
TRANSFER_IN_CASH_ADVANCES_AND_LOANS
TRANSFER_IN_DEPOSIT
TRANSFER_IN_INVESTMENT_AND_RETIREMENT_FUNDS
TRANSFER_IN_SAVINGS
TRANSFER_IN_ACCOUNT_TRANSFER
TRANSFER_IN_OTHER_TRANSFER_IN
TRANSFER_OUT_INVESTMENT_AND_RETIREMENT_FUNDS
TRANSFER_OUT_SAVINGS
TRANSFER_OUT_WITHDRAWAL
TRANSFER_OUT_ACCOUNT_TRANSFER
TRANSFER_OUT_OTHER_TRANSFER_OUT
LOAN_PAYMENTS_CAR_PAYMENT
LOAN_PAYMENTS_CREDIT_CARD_PAYMENT
LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT
LOAN_PAYMENTS_MORTGAGE_PAYMENT
LOAN_PAYMENTS_STUDENT_LOAN_PAYMENT
LOAN_PAYMENTS_OTHER_PAYMENT
BANK_FEES_ATM_FEES
BANK_FEES_FOREIGN_TRANSACTION_FEES
BANK_FEES_INSUFFICIENT_FUNDS
BANK_FEES_INTEREST_CHARGE
BANK_FEES_OVERDRAFT_FEES
BANK_FEES_OTHER_BANK_FEES
ENTERTAINMENT_CASINOS_AND_GAMBLING
ENTERTAINMENT_MUSIC_AND_AUDIO
ENTERTAINMENT_SPORTING_EVENTS_AMUSEMENT_PARKS_AND_MUSEUMS
ENTERTAINMENT_TV_AND_MOVIES
ENTERTAINMENT_VIDEO_GAMES
ENTERTAINMENT_OTHER_ENTERTAINMENT
FOOD_AND_DRINK_BEER_WINE_AND_LIQUOR
FOOD_AND_DRINK_COFFEE
FOOD_AND_DRINK_FAST_FOOD
FOOD_AND_DRINK_GROCERIES
FOOD_AND_DRINK_RESTAURANT
FOOD_AND_DRINK_VENDING_MACHINES
FOOD_AND_DRINK_OTHER_FOOD_AND_DRINK
GENERAL_MERCHANDISE_BOOKSTORES_AND_NEWSSTANDS
GENERAL_MERCHANDISE_CLOTHING_AND_ACCESSORIES
GENERAL_MERCHANDISE_CONVENIENCE_STORES
GENERAL_MERCHANDISE_DEPARTMENT_STORES
GENERAL_MERCHANDISE_DISCOUNT_STORES
GENERAL_MERCHANDISE_ELECTRONICS
GENERAL_MERCHANDISE_GIFTS_AND_NOVELTIES
GENERAL_MERCHANDISE_OFFICE_SUPPLIES
GENERAL_MERCHANDISE_ONLINE_MARKETPLACES
GENERAL_MERCHANDISE_PET_SUPPLIES
GENERAL_MERCHANDISE_SPORTING_GOODS
GENERAL_MERCHANDISE_SUPERSTORES
GENERAL_MERCHANDISE_TOBACCO_AND_VAPE
GENERAL_MERCHANDISE_OTHER_GENERAL_MERCHANDISE
HOME_IMPROVEMENT_FURNITURE
HOME_IMPROVEMENT_HARDWARE
HOME_IMPROVEMENT_REPAIR_AND_MAINTENANCE
HOME_IMPROVEMENT_SECURITY
HOME_IMPROVEMENT_OTHER_HOME_IMPROVEMENT
MEDICAL_DENTAL_CARE
MEDICAL_EYE_CARE
MEDICAL_NURSING_CARE
MEDICAL_PHARMACIES_AND_SUPPLEMENTS
MEDICAL_PRIMARY_CARE
MEDICAL_VETERINARY_SERVICES
MEDICAL_OTHER_MEDICAL
PERSONAL_CARE_GYMS_AND_FITNESS_CENTERS
PERSONAL_CARE_HAIR_AND_BEAUTY
PERSONAL_CARE_LAUNDRY_AND_DRY_CLEANING
PERSONAL_CARE_OTHER_PERSONAL_CARE
GENERAL_SERVICES_ACCOUNTING_AND_FINANCIAL_PLANNING
GENERAL_SERVICES_AUTOMOTIVE
GENERAL_SERVICES_CHILDCARE
GENERAL_SERVICES_CONSULTING_AND_LEGAL
GENERAL_SERVICES_EDUCATION
GENERAL_SERVICES_INSURANCE
GENERAL_SERVICES_POSTAGE_AND_SHIPPING
GENERAL_SERVICES_STORAGE
GENERAL_SERVICES_OTHER_GENERAL_SERVICES
GOVERNMENT_AND_NON_PROFIT_DONATIONS
GOVERNMENT_AND_NON_PROFIT_GOVERNMENT_DEPARTMENTS_AND_AGENCIES
GOVERNMENT_AND_NON_PROFIT_TAX_PAYMENT
GOVERNMENT_AND_NON_PROFIT_OTHER_GOVERNMENT_AND_NON_PROFIT
TRANSPORTATION_BIKES_AND_SCOOTERS
TRANSPORTATION_GAS
TRANSPORTATION_PARKING
TRANSPORTATION_PUBLIC_TRANSIT
TRANSPORTATION_TAXIS_AND_RIDE_SHARES
TRANSPORTATION_TOLLS
TRANSPORTATION_OTHER_TRANSPORTATION
TRAVEL_FLIGHTS
TRAVEL_LODGING
TRAVEL_RENTAL_CARS
TRAVEL_OTHER_TRAVEL
RENT_AND_UTILITIES_GAS_AND_ELECTRICITY
RENT_AND_UTILITIES_INTERNET_AND_CABLE
RENT_AND_UTILITIES_RENT
RENT_AND_UTILITIES_SEWAGE_AND_WASTE_MANAGEMENT
RENT_AND_UTILITIES_TELEPHONE
RENT_AND_UTILITIES_WATER
RENT_AND_UTILITIES_OTHER_UTILITIES`

const instruct_assist = `You are a friendly assistant who offers feedback to a user based on their budget.`

Deno.serve(async (req: Request) => {
	if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

	const { type } = await req.json()
	const user_id = await user(req)
	if (!user_id) return err('Unauthorized', 0)

	if (type.category) {
		const message = `Group: '${type.category.group}', Category: '${type.category.category}'`

		const response = await json(instruct_category, {
			role: 'user',
			content: message
		})

		return respond(response)
	} else if (type.transaction) {
		const message = `Name: '${type.transaction.name}'`

		const response = await json(instruct_transaction, {
			role: 'user',
			content: message
		})

		return respond(response)
	} else if (type.assistant) {
		const messages = type.assistant

		const body = new ReadableStream({
			start: async controller => {
				try {
					const stream = await openai.chat.completions.create({
						messages: [{
							role: 'system',
							content: instruct_assist
						}, ...messages.map(m => {
							return {
								role: m.role,
								content: m.content
							}
						})],
						model: 'gpt-3.5-turbo-0125',
						stream: true
					})

					for await (const chunk of stream) {
						let message = chunk.choices[0]?.delta?.content
						controller.enqueue(new TextEncoder().encode(message))
					}
					controller.close()
				} catch (error) {
					return err(error, 0)
				}
			}
		})
		return new Response(body, {
			headers: {
				...cors,
				"content-type": "text/plain",
				"x-content-type-options": "nosniff"
			}
		})

		// return respond(response)
	}

	return err('No type specified', 400)
})