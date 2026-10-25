import React, { useState } from 'react';

import { assessEligibility } from '../services/api';

import {

  Sprout,

  GraduationCap,

  HeartPulse,

  House,

  Users,

  BriefcaseBusiness,

  Banknote,

  Factory,

  Fish,

  Zap,

  Palette,

  Car,

  Baby,

  Search,

  ArrowLeft,

  CheckCircle2,

  AlertCircle,

} from 'lucide-react';



const categories = [

  { name: 'Agriculture', icon: Sprout, description: 'Farmers, crops and land support' },

  { name: 'Education', icon: GraduationCap, description: 'Students, scholarships and fees' },

  { name: 'Healthcare', icon: HeartPulse, description: 'Medical care and health support' },

  { name: 'Housing', icon: House, description: 'Housing assistance and construction' },

  { name: 'Social Welfare', icon: Users, description: 'Pensions and social assistance' },

  { name: 'Business & Entrepreneurship', icon: BriefcaseBusiness, description: 'Loans and business support' },

  { name: 'Banking & Finance', icon: Banknote, description: 'Financial inclusion and credit' },

  { name: 'Employment', icon: Factory, description: 'Jobs and livelihood opportunities' },

  { name: 'Fisheries', icon: Fish, description: 'Fishing and aquaculture support' },

  { name: 'Energy', icon: Zap, description: 'Electricity and energy assistance' },

  { name: 'Artisans & Weavers', icon: Palette, description: 'Traditional workers and craftspeople' },

  { name: 'Transport', icon: Car, description: 'Transport and mobility support' },

  { name: 'Women & Child Welfare', icon: Baby, description: 'Women, children and families' },

  { name: 'Animal Husbandry', icon: Sprout, description: 'Livestock and animal farming' },

  { name: 'Rural Development', icon: House, description: 'Village development and rural support' },

  { name: 'Employment & Skills', icon: BriefcaseBusiness, description: 'Skill development and training' },

];



const extraQuestions = {

  Agriculture: [

    { name: 'landholder', label: 'Do you own or cultivate agricultural land?', options: ['Yes', 'No', 'Tenant farmer'] },

    { name: 'farmer_type', label: 'Type of farming', options: ['Crop farming', 'Horticulture', 'Dairy farming', 'Other'] },

  ],

  Education: [

    { name: 'student_status', label: 'Are you currently studying?', options: ['Yes', 'No'] },

    { name: 'education_level', label: 'Current education level', options: ['School', 'Intermediate', 'Diploma', 'Undergraduate', 'Postgraduate', 'Other'] },

    { name: 'institution_type', label: 'Institution type', options: ['Government', 'Government-aided', 'Private', 'Other'] },

  ],

  Healthcare: [

    { name: 'disability_status', label: 'Do you have a disability?', options: ['Yes', 'No', 'Prefer not to say'] },

    { name: 'health_insurance', label: 'Do you have health insurance?', options: ['Yes', 'No', 'Not sure'] },

  ],

  Housing: [

    { name: 'owns_house', label: 'Does your family own a permanent house?', options: ['Yes', 'No'] },

    { name: 'housing_status', label: 'Housing requirement', options: ['New house', 'House repair', 'Housing loan', 'Other'] },

  ],

  'Social Welfare': [

    { name: 'family_status', label: 'Household situation', options: ['Low-income household', 'Widow or widower', 'Senior citizen household', 'Person with disability', 'Other'] },

    { name: 'ration_card', label: 'Do you have a ration card?', options: ['Yes', 'No', 'Not sure'] },

  ],

  'Business & Entrepreneurship': [

    { name: 'business_status', label: 'Business stage', options: ['Planning to start', 'Already operating', 'Self-employed'] },

    { name: 'business_type', label: 'Business type', options: ['Manufacturing', 'Retail', 'Services', 'Agriculture-related', 'Other'] },

  ],

  'Banking & Finance': [

    { name: 'bank_account', label: 'Do you have a bank account?', options: ['Yes', 'No'] },

    { name: 'financial_need', label: 'Type of financial support', options: ['Loan', 'Interest subsidy', 'Insurance', 'Pension', 'Other'] },

  ],

  Employment: [

    { name: 'employment_status', label: 'Current employment status', options: ['Unemployed', 'Employed', 'Self-employed', 'Daily wage worker'] },

    { name: 'skill_training', label: 'Interested in skill training?', options: ['Yes', 'No'] },

  ],

  Fisheries: [

    { name: 'fishing_activity', label: 'Your fishing activity', options: ['Marine fishing', 'Inland fishing', 'Aquaculture', 'Not currently involved'] },

  ],

  Energy: [

    { name: 'electricity_connection', label: 'Does your household have an electricity connection?', options: ['Yes', 'No'] },

  ],

  'Artisans & Weavers': [

    { name: 'artisan_trade', label: 'Your occupation', options: ['Weaving', 'Carpentry', 'Tailoring', 'Pottery', 'Metal work', 'Other'] },

  ],

  Transport: [

    { name: 'vehicle_owner', label: 'Do you own a vehicle?', options: ['Yes', 'No'] },

    { name: 'transport_need', label: 'Type of assistance needed', options: ['Vehicle loan', 'Vehicle subsidy', 'Transport employment', 'Other'] },

  ],

  'Women & Child Welfare': [

    { name: 'family_role', label: 'Select the applicable situation', options: ['Woman applicant', 'Pregnant woman', 'Mother with child', 'Girl student', 'Other'] },

  ],

  'Animal Husbandry': [

    { name: 'livestock', label: 'Do you own livestock?', options: ['Yes', 'No'] },

    { name: 'livestock_type', label: 'Livestock type', options: ['Cattle', 'Buffalo', 'Goats or sheep', 'Poultry', 'Other'] },

  ],

  'Rural Development': [

    { name: 'rural_household', label: 'Are you part of a rural household?', options: ['Yes', 'No'] },

    { name: 'self_help_group', label: 'Are you a member of a self-help group?', options: ['Yes', 'No'] },

  ],

  'Employment & Skills': [

    { name: 'training_status', label: 'Have you completed vocational training?', options: ['Yes', 'No'] },

    { name: 'employment_goal', label: 'Your primary goal', options: ['Find a job', 'Learn a skill', 'Start a business', 'Improve current skills'] },

  ],

};



export default function EligibilityCheck() {

  const [selectedCategory, setSelectedCategory] = useState('');

  const [form, setForm] = useState({

    age: '',

    gender: 'All',

    state: 'Andhra Pradesh',

    annual_income: '',

    occupation: 'Unemployed',

    residence_type: 'Rural',

  });

  const [extra, setExtra] = useState({});

  const [results, setResults] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const [expandedSchemeId, setExpandedSchemeId] = useState(null);

  const updateForm = (e) => {

    setForm((previous) => ({

      ...previous,

      [e.target.name]: e.target.value,

    }));

  };



  const updateExtra = (e) => {

    setExtra((previous) => ({

      ...previous,

      [e.target.name]: e.target.value,

    }));

  };



  const chooseCategory = (name) => {

    setSelectedCategory(name);

    setExtra({});

    setResults(null);

    setError('');

  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    setError('');

    setResults(null);



    try {

      const age = form.age === '' ? null : Number(form.age);

      const income = form.annual_income === '' ? null : Number(form.annual_income);



      if (!form.state.trim()) {

        throw new Error('Please enter your state of residence.');

      }



      if (age !== null && (!Number.isInteger(age) || age < 0 || age > 120)) {

        throw new Error('Please enter a valid age between 0 and 120.');

      }



      if (income !== null && (!Number.isFinite(income) || income < 0)) {

        throw new Error('Please enter a valid annual family income.');

      }



      // Send fields expected by the backend.

      // Category-specific answers are kept in the UI until the backend

      // implements matching rules for those additional fields.

      const payload = {

        age,

        gender: form.gender,

        state: form.state.trim(),

        annual_income: income,

        occupation: form.occupation,

        residence_type: form.residence_type,

        category: selectedCategory,



        // Category-specific answers

        land_ownership: extra.landholder ?? null,

        farming_type: extra.farmer_type ?? null,

      };



      const response = await assessEligibility(payload);



      if (!response || !Array.isArray(response.eligible_schemes)) {

        throw new Error('Unexpected response from the server. Check the backend endpoint.');

      }



      setResults(response);

    } catch (err) {

      console.error('Eligibility assessment failed:', err);

      setError(

        err.response?.data?.detail ||

        err.message ||

        'Unable to calculate eligibility. Please try again.'

      );

    } finally {

      setLoading(false);

    }

  };



  const questions = extraQuestions[selectedCategory] || [];

  const schemes = results?.eligible_schemes || [];



  if (!selectedCategory) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 60px)',
          background: '#f5f8fc',
          color: '#101828',
          paddingBottom: 48,
        }}
      >
        <section
          style={{
            background: 'linear-gradient(115deg, #21438e, #0788c5)',
            color: '#fff',
            textAlign: 'center',
            padding: '48px 24px 58px',
            marginBottom: 0,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 14px',
              marginBottom: 18,
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.12)',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <Search size={15} /> Andhra Pradesh Welfare Schemes Portal
          </div>
          <h1
            style={{
              margin: '0 0 14px',
              fontSize: 'clamp(28px, 3vw, 42px)',
              lineHeight: 1.2,
              fontWeight: 750,
              letterSpacing: '-0.6px',
            }}
          >
            Find Schemes for You
          </h1>
          <p
            style={{
              maxWidth: 700,
              margin: '0 auto',
              color: '#e7f3ff',
              fontSize: 16,
              lineHeight: 1.7,
            }}
          >
            Choose a category to discover Andhra Pradesh and Central Government
            welfare schemes that may match your profile.
          </p>
        </section>

        <div
          style={{
            maxWidth: 1120,
            margin: '-28px auto 0',
            padding: '0 24px',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 20,
            }}
          >
            {categories.map(({ name, icon: Icon, description }) => (
              <button
                type="button"
                key={name}
                onClick={() => chooseCategory(name)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  padding: 24,
                  minHeight: 158,
                  background: '#fff',
                  border: '1px solid #e0e8f2',
                  borderRadius: 18,
                  cursor: 'pointer',
                  color: '#101828',
                  boxShadow: '0 6px 20px rgba(20,45,85,0.06)',
                  transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#9bc8ff';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(20,45,85,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e0e8f2';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(20,45,85,0.06)';
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 46,
                    height: 46,
                    borderRadius: 13,
                    background: '#e7f3ff',
                    marginBottom: 18,
                  }}
                >
                  <Icon size={25} color="#0878bd" />
                </span>
                <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700 }}>
                  {name}
                </h3>
                <p style={{ margin: 0, color: '#66758c', fontSize: 13, lineHeight: 1.55 }}>
                  {description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const SelectedIcon =

    categories.find((category) => category.name === selectedCategory)?.icon || Search;



  return (

    <div className="container" style={{ maxWidth: 1000 }}>

      <button

        type="button"

        className="btn"

        onClick={() => {

          setSelectedCategory('');

          setResults(null);

          setError('');

        }}

        style={{ marginBottom: 20 }}

      >

        <ArrowLeft size={18} /> Back to Categories

      </button>



      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>

        <SelectedIcon size={30} color="#2563eb" />

        <h2>{selectedCategory} Schemes</h2>

      </div>



      <p style={{ color: '#475569', marginBottom: 20 }}>

        Enter your details to find schemes related to {selectedCategory.toLowerCase()}.

      </p>



      <form

        onSubmit={handleSubmit}

        style={{

          background: '#fff',

          padding: 24,

          borderRadius: 12,

          border: '1px solid #e2e8f0',

        }}

      >

        <h3 style={{ marginBottom: 16 }}>Your Basic Details</h3>



        <div

          style={{

            display: 'grid',

            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',

            gap: 16,

          }}

        >

          <div className="form-group">

            <label htmlFor="age">Age (Years)</label>

            <input

              id="age"

              type="number"

              min="0"

              max="120"

              step="1"

              name="age"

              className="form-control"

              value={form.age}

              onChange={updateForm}

              placeholder="e.g. 30"

            />

          </div>



          <div className="form-group">

            <label htmlFor="gender">Gender</label>

            <select

              id="gender"

              name="gender"

              className="form-control"

              value={form.gender}

              onChange={updateForm}

            >

              <option value="All">Prefer not to specify</option>

              <option value="Female">Female</option>

              <option value="Male">Male</option>

              <option value="Transgender">Transgender</option>

            </select>

          </div>



          <div className="form-group">

            <label htmlFor="state">State of Residence</label>

            <input

              id="state"

              name="state"

              className="form-control"

              value={form.state}

              onChange={updateForm}

              required

            />

          </div>



          <div className="form-group">

            <label htmlFor="annual_income">Annual Family Income (₹)</label>

            <input

              id="annual_income"

              type="number"

              min="0"

              name="annual_income"

              className="form-control"

              value={form.annual_income}

              onChange={updateForm}

              placeholder="e.g. 120000"

            />

          </div>



          <div className="form-group">

            <label htmlFor="occupation">Occupation</label>

            <select

              id="occupation"

              name="occupation"

              className="form-control"

              value={form.occupation}

              onChange={updateForm}

            >

              <option value="Farmer">Farmer</option>

              <option value="Student">Student</option>

              <option value="Unemployed">Unemployed / Homemaker</option>

              <option value="Employed">Employed</option>

              <option value="Self-employed">Self-employed</option>

              <option value="Artisan">Artisan / Weaver</option>

              <option value="Fisher">Fisher</option>

              <option value="Retired">Retired / Senior citizen</option>

              <option value="Unorganized worker">Unorganized worker</option>

              <option value="All">Other / Not specified</option>

            </select>

          </div>



          <div className="form-group">

            <label htmlFor="residence_type">Residence Type</label>

            <select

              id="residence_type"

              name="residence_type"

              className="form-control"

              value={form.residence_type}

              onChange={updateForm}

            >

              <option value="Rural">Rural</option>

              <option value="Urban">Urban</option>

              <option value="All">Not specified</option>

            </select>

          </div>

        </div>



        {questions.length > 0 && (

          <>

            <h3 style={{ marginTop: 26, marginBottom: 16 }}>

              About {selectedCategory}

            </h3>



            <div

              style={{

                display: 'grid',

                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',

                gap: 16,

              }}

            >

              {questions.map((question) => (

                <div className="form-group" key={question.name}>

                  <label htmlFor={question.name}>{question.label}</label>

                  <select

                    id={question.name}

                    name={question.name}

                    className="form-control"

                    value={extra[question.name] || ''}

                    onChange={updateExtra}

                  >

                    <option value="">Select an answer</option>

                    {question.options.map((option) => (

                      <option key={option} value={option}>

                        {option}

                      </option>

                    ))}

                  </select>

                </div>

              ))}

            </div>

          </>

        )}



        <button type="submit" className="btn" disabled={loading} style={{ marginTop: 20 }}>

          {loading ? 'Finding Matching Schemes...' : 'Find Matching Schemes'}

        </button>

      </form>



      {error && (

        <div

          role="alert"

          style={{

            marginTop: 18,

            padding: 14,

            color: '#991b1b',

            background: '#fef2f2',

            borderRadius: 8,

            border: '1px solid #fecaca',

          }}

        >

          {error}

        </div>

      )}



      {results && (

        <section style={{ marginTop: 28 }}>

          <h2>Assessment Results ({results.count ?? schemes.length})</h2>

          <p style={{ color: '#64748b', marginTop: 6 }}>

            These are potential matches based on the available database fields, not confirmed eligibility.

            Check the official scheme rules before applying.

          </p>



          <h3

            style={{

              marginTop: 22,

              color: '#92400e',

              display: 'flex',

              alignItems: 'center',

              gap: 8,

            }}

          >

            <AlertCircle size={20} />

            Potential Matches

          </h3>



          {schemes.length === 0 ? (

            <div

              style={{

                marginTop: 14,

                padding: 20,

                background: '#fff',

                border: '1px solid #e2e8f0',

                borderRadius: 12,

              }}

            >

              <p>No matching schemes were found for this category and profile.</p>

              <p style={{ color: '#64748b', marginTop: 6 }}>

                Try checking your details or selecting another category.

              </p>

            </div>

          ) : (

            schemes.map((scheme) => (

              <article

                key={scheme.scheme_id}

                className="card"

                style={{

                  marginTop: 14,

                  padding: 20,

                  background: '#fff',

                  border: '1px solid #e2e8f0',

                  borderRadius: 12,

                }}

              >

                <div

                  style={{

                    display: 'flex',

                    justifyContent: 'space-between',

                    alignItems: 'flex-start',

                    gap: 12,

                    flexWrap: 'wrap',

                  }}

                >

                  <h3>{scheme.scheme_name}</h3>

                  <span

                    style={{

                      background: '#fef3c7',

                      color: '#92400e',

                      padding: '5px 9px',

                      borderRadius: 8,

                      fontSize: '0.8rem',

                    }}

                  >

                    Needs verification

                  </span>

                </div>



                <p style={{ color: '#475569', marginTop: 10 }}>

                  {scheme.message ||

                    'Potential match. Confirm the scheme conditions with the official authority.'}

                </p>



                {scheme.matched_rules?.length > 0 && (

                  <ul style={{ paddingLeft: 20, marginTop: 10 }}>

                    {scheme.matched_rules.map((rule, index) => (

                      <li key={index}>{rule}</li>

                    ))}

                  </ul>

                )}

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>

                  <button

                    type="button"

                    className="btn"

                    onClick={() =>

                      setExpandedSchemeId(

                        expandedSchemeId === scheme.scheme_id ? null : scheme.scheme_id

                      )

                    }

                  >

                    {expandedSchemeId === scheme.scheme_id ? 'Hide Details' : 'View Details'}

                  </button>



                  {/^https?:\/\//i.test(scheme.official_url || '') && (

                    <a

                      href={scheme.official_url}

                      target="\_blank"

                      rel="noopener noreferrer"

                      className="btn"

                    >

                      Official Website ↗

                    </a>

                  )}

                </div>



                {expandedSchemeId === scheme.scheme_id && (

                  <div style={{

                    marginTop: 16,

                    padding: 16,

                    background: '#f8fafc',

                    border: '1px solid #e2e8f0',

                    borderRadius: 10

                  }}>

                    <h4>About this scheme</h4>

                    <p>{scheme.description || 'Description unavailable.'}</p>



                    <h4>Benefits</h4>

                    <p>{scheme.benefits || 'Benefits unavailable.'}</p>



                    <h4>Required Documents</h4>

                    <p>{scheme.required_documents || 'Documents unavailable.'}</p>



                    <h4>Application Process</h4>

                    <p>{scheme.application_process || 'Application instructions unavailable.'}</p>



                    <p style={{ marginTop: 12, color: '#64748b' }}>

                      Verification status: {scheme.verification_status || 'Unknown'}

                    </p>

                  </div>

                )}

              </article>

            ))

          )}

        </section>

      )}

    </div>

  );

}
